import { NextRequest } from "next/server";
import { retrieve, type RetrievedChunk } from "@/lib/rag";
import { tavilySearch, type WebResult } from "@/lib/web-search";

export const runtime = "nodejs";
export const maxDuration = 60;

type ChatMessage = { role: "user" | "assistant" | "system"; content: string };
type Mode = "policy" | "web" | "deep";

const SYS_POLICY = `You are the AI Advisor of the Investment Screening Intelligence Platform.
You answer questions about cross-border foreign investment screening (FDI screening) using ONLY the policy excerpts provided below.

Rules:
1. Ground every factual statement in the provided excerpts. Don't invent.
2. After each factual claim, add citation markers like [1], [2] referring to the numbered excerpts. Multiple at once: [1][2].
3. Answer in the SAME language the user asked in (English if English, Chinese if Chinese).
4. Structure clearly: short paragraphs, lists when comparing countries, bold key terms.
5. If the excerpts don't contain enough info, say so explicitly and suggest a refined query.`;

const SYS_WEB = `You are the AI Advisor of the Investment Screening Intelligence Platform.
You answer using ONLY the live web search results below.

Rules:
1. Ground every claim in the web results.
2. Cite using [W1], [W2] etc. matching the numbered web sources.
3. Answer in the SAME language as the user.
4. Be concise and current — these are live news / recent web pages.
5. If results don't cover the question, say so.`;

const SYS_DEEP = `You are the AI Advisor of the Investment Screening Intelligence Platform.
You produce a structured INVESTMENT OPINION combining (a) authoritative policy excerpts and (b) live web evidence.

Rules:
1. Ground in BOTH sources. Use [1], [2] for policy excerpts and [W1], [W2] for web results.
2. Answer in the SAME language as the user.
3. Use this structure:
   ### Regulatory Landscape  — what laws apply (cite policies)
   ### Recent Developments  — latest news / cases (cite web)
   ### Key Risks  — what's likely to be blocked or scrutinised
   ### Compliance Recommendations  — concrete next steps
4. Be specific and actionable.`;

function buildPolicyBlock(chunks: RetrievedChunk[]): string {
  return chunks
    .map(
      (c, i) =>
        `[${i + 1}] Country: ${c.country}　Policy: ${c.title}${
          c.year ? ` (${c.year})` : ""
        }\n${c.text}`,
    )
    .join("\n\n---\n\n");
}

function buildWebBlock(results: WebResult[]): string {
  return results
    .map(
      (r, i) =>
        `[W${i + 1}] ${r.title}\nURL: ${r.url}\n${r.content.slice(0, 600)}`,
    )
    .join("\n\n---\n\n");
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    messages: ChatMessage[];
    mode?: Mode;
    industry?: string;
    country?: string;
  };
  const mode: Mode = body.mode ?? "policy";
  const userMsg = body.messages[body.messages.length - 1]?.content ?? "";
  if (!userMsg) {
    return new Response("missing user message", { status: 400 });
  }

  const filters: { country_slug?: string; industry?: string } = {};
  if (body.country) filters.country_slug = body.country;
  if (body.industry) filters.industry = body.industry;

  // ── Retrieve depending on mode ─────────────────────────────
  let policyChunks: RetrievedChunk[] = [];
  let webResults: WebResult[] = [];

  try {
    if (mode === "policy" || mode === "deep") {
      try {
        policyChunks = await retrieve(userMsg, mode === "deep" ? 4 : 6, filters);
      } catch (e) {
        // chunks.json may not exist yet — surface but don't crash
        console.warn("policy retrieve failed:", e);
        policyChunks = [];
      }
    }
    if (mode === "web" || mode === "deep") {
      try {
        webResults = await tavilySearch(userMsg, {
          maxResults: mode === "deep" ? 4 : 6,
        });
      } catch (e) {
        console.warn("web search failed:", e);
        webResults = [];
      }
    }
  } catch (e) {
    return new Response(`retrieval error: ${String(e)}`, { status: 500 });
  }

  // ── Build system prompt with grounded context ─────────────
  let sys = "";
  if (mode === "policy") {
    sys = `${SYS_POLICY}\n\nPolicy excerpts (ranked by relevance):\n\n${buildPolicyBlock(policyChunks)}`;
  } else if (mode === "web") {
    sys = `${SYS_WEB}\n\nLive web results:\n\n${buildWebBlock(webResults)}`;
  } else {
    sys = `${SYS_DEEP}\n\n=== Policy excerpts ===\n\n${buildPolicyBlock(policyChunks)}\n\n=== Live web results ===\n\n${buildWebBlock(webResults)}`;
  }

  const history = body.messages.slice(0, -1).filter((m) => m.role !== "system");

  const zhipuKey = process.env.ZHIPU_API_KEY;
  if (!zhipuKey) {
    return new Response("ZHIPU_API_KEY not set", { status: 500 });
  }

  const upstream = await fetch(
    "https://open.bigmodel.cn/api/paas/v4/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${zhipuKey}`,
      },
      body: JSON.stringify({
        model: "glm-4.7-flash",
        stream: true,
        temperature: 0.3,
        messages: [
          { role: "system", content: sys },
          ...history,
          { role: "user", content: userMsg },
        ],
      }),
    },
  );

  if (!upstream.ok || !upstream.body) {
    return new Response(
      `chat error: ${upstream.status} ${await upstream.text()}`,
      { status: 502 },
    );
  }

  // ── Source payload (policy + web together) ────────────────
  const sourcesPayload = JSON.stringify({
    type: "sources",
    mode,
    policy: policyChunks.map((c, i) => ({
      n: i + 1,
      id: c.id,
      policy_id: c.policy_id,
      country: c.country,
      title: c.title,
      year: c.year,
      score: c.score,
      snippet: c.text.slice(0, 240),
    })),
    web: webResults.map((r, i) => ({
      n: i + 1,
      tag: `W${i + 1}`,
      title: r.title,
      url: r.url,
      snippet: r.content.slice(0, 240),
      score: r.score,
    })),
  });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(encoder.encode("event: sources\n"));
      controller.enqueue(encoder.encode(`data: ${sourcesPayload}\n\n`));

      const reader = upstream.body!.getReader();
      const decoder = new TextDecoder();
      let buffered = "";
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffered += decoder.decode(value, { stream: true });
          const lines = buffered.split("\n");
          buffered = lines.pop() ?? "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const payload = trimmed.slice(5).trim();
            if (payload === "[DONE]") {
              controller.enqueue(encoder.encode("event: done\ndata: {}\n\n"));
              continue;
            }
            try {
              const obj = JSON.parse(payload);
              const delta = obj.choices?.[0]?.delta?.content ?? "";
              if (delta) {
                controller.enqueue(encoder.encode("event: delta\n"));
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({ text: delta })}\n\n`,
                  ),
                );
              }
            } catch {
              // ignore
            }
          }
        }
      } catch (e) {
        controller.enqueue(
          encoder.encode(
            `event: error\ndata: ${JSON.stringify({ message: String(e) })}\n\n`,
          ),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
