import { NextRequest } from "next/server";
import {
  retrieve,
  retrieveISM,
  embedQuery,
  type RetrievedChunk,
  type RetrievedISM,
} from "@/lib/rag";
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
You produce a structured INVESTMENT OPINION by fusing THREE sources:
(a) authoritative policy excerpts (the statutes themselves),
(b) structured ISM data — PRISM Investment Screening Mechanism profiles with each country's mechanism attributes, thresholds, covered sectors and change history, and
(c) live web evidence (recent news / cases).

Rules:
1. Ground in ALL available sources. Cite with [1], [2] for policy excerpts, [I1], [I2] for ISM data profiles, and [W1], [W2] for web results.
2. Prefer the structured ISM data for hard facts (thresholds, timeframes, covered sectors, lead authority); use policy excerpts for legal wording and web for the latest developments.
3. Answer in the SAME language as the user.
4. Use this structure:
   ### Regulatory Landscape  — what laws & mechanisms apply (cite policy + ISM)
   ### Mechanism Snapshot  — thresholds, timeframe, covered sectors, lead authority (cite ISM)
   ### Recent Developments  — latest news / cases (cite web)
   ### Key Risks  — what's likely to be blocked or scrutinised
   ### Compliance Recommendations  — concrete next steps
5. Be specific and actionable.`;

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

function buildISMBlock(records: RetrievedISM[]): string {
  return records
    .map((r, i) => `[I${i + 1}] ${r.text}`)
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
  let ismRecords: RetrievedISM[] = [];
  let webResults: WebResult[] = [];

  // Embed the query once and reuse for both policy + ISM retrieval.
  let queryEmb: number[] | undefined;
  if (mode === "policy" || mode === "deep") {
    try {
      queryEmb = await embedQuery(userMsg);
    } catch (e) {
      console.warn("embed query failed:", e);
    }
  }

  try {
    if (mode === "policy" || mode === "deep") {
      try {
        policyChunks = await retrieve(
          userMsg,
          mode === "deep" ? 4 : 6,
          filters,
          queryEmb,
        );
      } catch (e) {
        // chunks.json may not exist yet — surface but don't crash
        console.warn("policy retrieve failed:", e);
        policyChunks = [];
      }
    }
    if (mode === "deep") {
      try {
        ismRecords = await retrieveISM(userMsg, 3, filters, queryEmb);
      } catch (e) {
        console.warn("ISM retrieve failed:", e);
        ismRecords = [];
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
    sys = `${SYS_DEEP}\n\n=== Policy excerpts ===\n\n${buildPolicyBlock(policyChunks)}\n\n=== ISM structured data ===\n\n${buildISMBlock(ismRecords)}\n\n=== Live web results ===\n\n${buildWebBlock(webResults)}`;
  }

  // ── Tier-2 multi-turn comparison directive ────────────────
  // On follow-up turns, the user is usually comparing or drilling into
  // jurisdictions raised earlier. Make the agent carry that context and
  // present comparisons as a clean side-by-side rather than prose only.
  const priorTurns = body.messages.filter((m) => m.role !== "system").length - 1;
  const comparing =
    /compare|comparison|versus|\bvs\b|difference|differ|whereas|相比|对比|比较|区别|差异/i.test(
      userMsg,
    );
  if (priorTurns > 0 || comparing) {
    sys +=
      "\n\nMULTI-TURN & COMPARISON: This is a continuing conversation. Resolve pronouns and follow-ups against the earlier turns (e.g. 'what about Germany?' continues the same topic). When two or more jurisdictions, policies or time periods are being compared, present the comparison as a compact Markdown table (one row per item, columns for the dimensions compared), then add a short interpretation below it. Keep citation markers in the table cells.";
  }

  // ── Force the answer language to match the user's question ─
  // The grounding context is all in English, which biases small models
  // toward replying in English even when asked in Chinese. Make it explicit.
  const hasChinese = /[一-鿿]/.test(userMsg);
  sys += hasChinese
    ? "\n\nIMPORTANT — LANGUAGE: The user asked in Chinese. You MUST write your ENTIRE response in Simplified Chinese (简体中文): all headings, body text and explanations. Keep citation markers ([1], [W1]), URLs, and official law/agency names in their original form."
    : "\n\nIMPORTANT — LANGUAGE: The user asked in English. Write your entire response in English.";

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
    ism: ismRecords.map((r, i) => ({
      n: i + 1,
      tag: `I${i + 1}`,
      country: r.country,
      year: r.year,
      lead_authority: r.lead_authority,
      established: r.established,
      score: r.score,
      snippet: r.text.slice(0, 260),
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
