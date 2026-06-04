"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";
import Link from "next/link";
import {
  ArrowUp,
  Loader2,
  Sparkles,
  FileText,
  ExternalLink,
  User,
  Bot,
  BookOpen,
  Globe,
  Layers3,
  AlertCircle,
  RotateCcw,
} from "lucide-react";

type Mode = "policy" | "web" | "deep";

type PolicySource = {
  n: number;
  id: string;
  policy_id: string;
  country: string;
  title: string;
  year: number | null;
  score: number;
  snippet: string;
};

type WebSource = {
  n: number;
  tag: string;
  title: string;
  url: string;
  snippet: string;
  score?: number;
};

type ISMSource = {
  n: number;
  tag: string;
  country: string;
  year: number | null;
  lead_authority: string | null;
  established: number | null;
  score: number;
  snippet: string;
};

type Message = {
  role: "user" | "assistant";
  content: string;
  mode?: Mode;
  policySources?: PolicySource[];
  ismSources?: ISMSource[];
  webSources?: WebSource[];
  error?: string;
};

// Turn raw upstream errors into a short, human message. The Zhipu/GLM API
// returns 429 + code 1302 when the account hits its rate limit.
function friendlyError(raw: string): string {
  if (/\b429\b|1302|rate limit|速率限制|频率/i.test(raw)) {
    return "The model API is rate-limited right now. Wait a few seconds and retry.";
  }
  if (/\b50[023]\b|timeout|ETIMEDOUT|fetch failed|network/i.test(raw)) {
    return "Couldn't reach the model service. Check your connection and retry.";
  }
  if (/ZHIPU_API_KEY|TAVILY_API_KEY|not set/i.test(raw)) {
    return "The service isn't fully configured (missing API key).";
  }
  return "Something went wrong generating the answer. Please retry.";
}

const SUGGESTIONS = [
  "How do US and EU screening thresholds differ for Chinese buyers?",
  "What is the German notification threshold for semiconductor M&A?",
  "Which countries cover critical minerals under FDI screening?",
  "What changed in US CFIUS scope after FIRRMA?",
];

const MODES: { id: Mode; label: string; icon: React.ReactNode; hint: string }[] =
  [
    {
      id: "policy",
      label: "Policy",
      icon: <BookOpen className="h-3.5 w-3.5" />,
      hint: "Search 141 statutes via vector retrieval",
    },
    {
      id: "web",
      label: "Web",
      icon: <Globe className="h-3.5 w-3.5" />,
      hint: "Live web search via Tavily for recent news / cases",
    },
    {
      id: "deep",
      label: "Deep Research",
      icon: <Layers3 className="h-3.5 w-3.5" />,
      hint: "Combine policy + web, produce a structured opinion",
    },
  ];

export function ChatRoom({
  industry,
  country,
  compact = false,
}: {
  industry?: string;
  country?: string;
  // compact = single-column layout for the narrow floating popout window
  compact?: boolean;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<Mode>("policy");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  async function send(text: string, base: Message[] = messages) {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: "user", content: text };
    const next = [...base, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);

    setMessages((m) => [
      ...m,
      {
        role: "assistant",
        content: "",
        mode,
        policySources: [],
        ismSources: [],
        webSources: [],
      },
    ]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next.map((m) => ({ role: m.role, content: m.content })),
          mode,
          industry,
          country,
        }),
      });
      if (!res.ok || !res.body) {
        const txt = await res.text();
        throw new Error(`HTTP ${res.status}: ${txt}`);
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let event = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          if (line.startsWith("event:")) {
            event = line.slice(6).trim();
          } else if (line.startsWith("data:")) {
            const payload = line.slice(5).trim();
            if (!payload) continue;
            try {
              const obj = JSON.parse(payload);
              if (event === "sources") {
                setMessages((m) => {
                  const copy = [...m];
                  copy[copy.length - 1] = {
                    ...copy[copy.length - 1],
                    policySources: obj.policy ?? [],
                    ismSources: obj.ism ?? [],
                    webSources: obj.web ?? [],
                  };
                  return copy;
                });
              } else if (event === "delta") {
                setMessages((m) => {
                  const copy = [...m];
                  const last = copy[copy.length - 1];
                  copy[copy.length - 1] = {
                    ...last,
                    content: last.content + (obj.text ?? ""),
                  };
                  return copy;
                });
              }
            } catch {
              // ignore
            }
          } else if (line === "") {
            event = "";
          }
        }
      }
    } catch (e) {
      const error = friendlyError(String(e));
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = { role: "assistant", content: "", error };
        return copy;
      });
    } finally {
      setLoading(false);
    }
  }

  function retryLast() {
    if (loading) return;
    let base = [...messages];
    if (base[base.length - 1]?.role === "assistant") base = base.slice(0, -1);
    let text = "";
    if (base[base.length - 1]?.role === "user") {
      text = base[base.length - 1].content;
      base = base.slice(0, -1);
    }
    if (text) void send(text, base);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void send(input);
  }

  const latestAssistant = [...messages]
    .reverse()
    .find((m) => m.role === "assistant");

  return (
    <div
      className={
        compact
          ? "flex h-full flex-col gap-3"
          : "grid gap-4 lg:grid-cols-[1fr_320px]"
      }
    >
      {/* Main column: composer pinned on top, messages scroll below — one card */}
      <div
        className={`flex flex-col overflow-hidden rounded-2xl border border-white/15 ${
          compact ? "min-h-0 flex-1" : ""
        }`}
        style={{
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
        }}
      >
        {/* Composer — always visible at the top, no need to scroll down */}
        <form onSubmit={onSubmit} className="border-b border-white/10 p-4">
          <div
            className="relative overflow-hidden rounded-2xl border border-white/25 p-4 transition focus-within:border-white/45"
            style={{
              background: "rgba(255,255,255,0.06)",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.12), 0 8px 32px rgba(0,0,0,0.18)",
            }}
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send(input);
                }
              }}
              placeholder="Ask anything about global FDI screening…"
              rows={2}
              className="block max-h-[50vh] min-h-[52px] w-full resize-y border-0 bg-transparent text-base text-white placeholder:text-white/40 outline-none"
            />

            <div className="mt-3 flex items-center gap-3">
              {/* Unified pill mode bar — Tavily style */}
              <div
                className="inline-flex items-center gap-0.5 rounded-full border border-white/15 p-1 backdrop-blur"
                style={{ background: "rgba(255,255,255,0.08)" }}
              >
                {MODES.map((m) => {
                  const active = mode === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMode(m.id)}
                      title={m.hint}
                      className={
                        active
                          ? "inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-navy-dark shadow-sm transition"
                          : "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-white/65 transition hover:text-white"
                      }
                    >
                      {m.icon}
                      {m.label}
                    </button>
                  );
                })}
              </div>

              <span className="ml-auto hidden truncate text-[11px] text-white/45 sm:inline">
                {MODES.find((m) => m.id === mode)?.hint}
              </span>

              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/95 text-navy-dark shadow-md transition hover:scale-105 hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Send"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowUp className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </form>

        {/* messages scroll area below the composer */}
        <div
          ref={scrollRef}
          className={`flex-1 space-y-4 overflow-y-auto p-5 ${
            compact ? "min-h-[200px]" : "min-h-[420px]"
          }`}
          style={{ maxHeight: compact ? "100%" : "60vh" }}
        >
          {messages.length === 0 && (
            <div className="space-y-5">
              <div
                className="flex items-start gap-3 rounded-xl border border-white/20 p-4"
                style={{ background: "rgba(255,255,255,0.06)" }}
              >
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-navy-soft to-navy-light text-navy-dark">
                  <Sparkles className="h-4 w-4" />
                </span>
                <div className="text-sm leading-relaxed text-white/85">
                  Hi! I&apos;m the AI Advisor. Ask about any FDI screening
                  topic — I&apos;ll ground my answer in the 141 statutes
                  (<strong className="text-white">Policy</strong> mode), live news
                  (<strong className="text-white">Web</strong>), or both
                  (<strong className="text-white">Deep Research</strong>),
                  with inline citations.
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-white/50">
                  Try one of these
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="rounded-xl border border-white/15 px-3 py-2.5 text-left text-sm text-white/85 transition hover:-translate-y-0.5 hover:border-white/35 hover:text-white"
                      style={{ background: "rgba(255,255,255,0.05)" }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <MessageBubble
              key={i}
              msg={m}
              streaming={loading && i === messages.length - 1}
              onRetry={retryLast}
            />
          ))}
        </div>
      </div>

      {/* Sidebar: sources — dark glass */}
      <aside
        className={`overflow-y-auto rounded-2xl border border-white/15 p-5 ${
          compact
            ? "max-h-[32vh] shrink-0"
            : "max-h-[78vh] min-h-[200px]"
        }`}
        style={{
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
        }}
      >
        <div className="mb-3">
          <h3 className="text-sm font-bold text-white">Sources</h3>
          <p className="text-xs text-white/55">
            Excerpts cited in the latest answer
          </p>
        </div>
        <SourcesPanel
          policy={latestAssistant?.policySources ?? []}
          ism={latestAssistant?.ismSources ?? []}
          web={latestAssistant?.webSources ?? []}
        />
      </aside>
    </div>
  );
}

function MessageBubble({
  msg,
  streaming,
  onRetry,
}: {
  msg: Message;
  streaming?: boolean;
  onRetry?: () => void;
}) {
  if (msg.role === "user") {
    return (
      <div className="flex items-start justify-end gap-2">
        <div className="glass-primary max-w-[80%] rounded-2xl rounded-tr-md px-4 py-2.5 text-sm leading-relaxed">
          {msg.content}
        </div>
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/70 text-navy-mid backdrop-blur">
          <User className="h-4 w-4" />
        </span>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-2">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-navy-light to-navy-soft text-navy-dark">
        <Bot className="h-4 w-4" />
      </span>
      <div
        className="max-w-[85%] rounded-2xl rounded-tl-md border border-white/15 px-4 py-3 text-sm leading-relaxed text-white/90"
        style={{ background: "rgba(255,255,255,0.06)", backdropFilter: "blur(10px)" }}
      >
        {msg.error ? (
          <div className="flex items-start gap-2.5">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
            <div>
              <div className="text-white/85">{msg.error}</div>
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-white/25 bg-white/10 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-white/20"
                >
                  <RotateCcw className="h-3 w-3" /> Retry
                </button>
              )}
            </div>
          </div>
        ) : msg.content ? (
          <Markdown
            text={msg.content}
            policy={msg.policySources ?? []}
            ism={msg.ismSources ?? []}
            web={msg.webSources ?? []}
          />
        ) : streaming ? (
          <span className="inline-flex items-center gap-2 text-white/60">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Searching &
            thinking…
          </span>
        ) : (
          <span className="text-white/50">(empty)</span>
        )}
        {streaming && msg.content && (
          <span className="ml-0.5 inline-block h-3.5 w-1 animate-pulse bg-white align-middle" />
        )}
      </div>
    </div>
  );
}

// ── Lightweight markdown renderer (headings / lists / bold / italic / code)
//    that also turns [n] and [Wn] citation markers into clickable chips. ──

type Block =
  | { type: "heading"; level: number; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "table"; header: string[]; rows: string[][] }
  | { type: "hr" }
  | { type: "p"; text: string };

function splitRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((c) => c.trim());
}

function parseBlocks(src: string): Block[] {
  const blocks: Block[] = [];
  let para: string[] = [];
  let list: { type: "ul" | "ol"; items: string[] } | null = null;

  const flushPara = () => {
    if (para.length) {
      blocks.push({ type: "p", text: para.join(" ") });
      para = [];
    }
  };
  const flushList = () => {
    if (list) {
      blocks.push(list);
      list = null;
    }
  };

  const lines = src.split("\n");
  for (let li = 0; li < lines.length; li++) {
    const line = lines[li].trim();
    if (!line) {
      flushPara();
      flushList();
      continue;
    }

    // GFM table: a row with pipes followed by a |---|---| delimiter line
    const nextLine = (lines[li + 1] ?? "").trim();
    if (
      line.includes("|") &&
      nextLine.includes("|") &&
      nextLine.includes("-") &&
      /^[\s|:-]+$/.test(nextLine)
    ) {
      flushPara();
      flushList();
      const header = splitRow(line);
      const rows: string[][] = [];
      li += 1; // skip delimiter
      while (
        li + 1 < lines.length &&
        lines[li + 1].trim().includes("|") &&
        lines[li + 1].trim() !== ""
      ) {
        rows.push(splitRow(lines[li + 1]));
        li += 1;
      }
      blocks.push({ type: "table", header, rows });
      continue;
    }

    const heading = line.match(/^(#{1,4})\s+(.*)$/);
    if (heading) {
      flushPara();
      flushList();
      blocks.push({ type: "heading", level: heading[1].length, text: heading[2] });
      continue;
    }
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line)) {
      flushPara();
      flushList();
      blocks.push({ type: "hr" });
      continue;
    }
    const ordered = line.match(/^\d+[.)]\s+(.*)$/);
    if (ordered) {
      flushPara();
      if (!list || list.type !== "ol") {
        flushList();
        list = { type: "ol", items: [] };
      }
      list.items.push(ordered[1]);
      continue;
    }
    const bullet = line.match(/^[-*+]\s+(.*)$/);
    if (bullet) {
      flushPara();
      if (!list || list.type !== "ul") {
        flushList();
        list = { type: "ul", items: [] };
      }
      list.items.push(bullet[1]);
      continue;
    }
    flushList();
    para.push(line);
  }
  flushPara();
  flushList();
  return blocks;
}

function renderCitations(
  text: string,
  policy: PolicySource[],
  ism: ISMSource[],
  web: WebSource[],
  keyPrefix: string,
): React.ReactNode[] {
  const parts = text.split(
    /(\[(?:W\d+|I\d+|\d+)\](?:\[(?:W\d+|I\d+|\d+)\])*)/g,
  );
  return parts.map((part, i) => {
    if (part && /^(\[(?:[WI]?\d+)\])+$/.test(part)) {
      const matches = part.match(/\[([WI]?\d+)\]/g) ?? [];
      return (
        <span key={`${keyPrefix}-${i}`} className="inline-flex flex-wrap gap-0.5">
          {matches.map((m, j) => {
            const tag = m.slice(1, -1);
            if (tag.startsWith("W")) {
              const n = parseInt(tag.slice(1), 10);
              const src = web.find((s) => s.n === n);
              if (!src) return <span key={j}>{m}</span>;
              return (
                <a
                  key={j}
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mx-0.5 inline-flex h-4 items-center gap-0.5 rounded bg-emerald-500/15 px-1 text-[10px] font-bold text-emerald-700 hover:bg-emerald-500/30"
                  title={src.title}
                >
                  W{n}
                </a>
              );
            }
            if (tag.startsWith("I")) {
              const n = parseInt(tag.slice(1), 10);
              const src = ism.find((s) => s.n === n);
              if (!src) return <span key={j}>{m}</span>;
              return (
                <span
                  key={j}
                  className="mx-0.5 inline-flex h-4 items-center gap-0.5 rounded bg-amber-500/20 px-1 text-[10px] font-bold text-amber-700"
                  title={`ISM · ${src.country}${src.year ? ` (${src.year})` : ""}`}
                >
                  I{n}
                </span>
              );
            }
            const n = parseInt(tag, 10);
            const src = policy.find((s) => s.n === n);
            if (!src) return <span key={j}>{m}</span>;
            return (
              <Link
                key={j}
                href={`/policies/${src.policy_id}`}
                className="mx-0.5 inline-flex h-4 w-4 items-center justify-center rounded bg-navy-soft/25 text-[10px] font-bold text-navy-mid hover:bg-navy-soft hover:text-white"
                title={`${src.country} · ${src.title}`}
              >
                {n}
              </Link>
            );
          })}
        </span>
      );
    }
    return <span key={`${keyPrefix}-${i}`}>{part}</span>;
  });
}

function renderInline(
  text: string,
  policy: PolicySource[],
  ism: ISMSource[],
  web: WebSource[],
  keyPrefix: string,
): React.ReactNode[] {
  const tokens = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*\n]+\*)/g);
  const nodes: React.ReactNode[] = [];
  tokens.forEach((tok, i) => {
    if (!tok) return;
    const k = `${keyPrefix}-${i}`;
    if (tok.startsWith("**") && tok.endsWith("**") && tok.length > 4) {
      nodes.push(
        <strong key={k} className="font-bold text-white">
          {renderCitations(tok.slice(2, -2), policy, ism, web, k)}
        </strong>,
      );
    } else if (tok.startsWith("`") && tok.endsWith("`") && tok.length > 2) {
      nodes.push(
        <code
          key={k}
          className="rounded bg-white/10 px-1 py-0.5 text-[0.85em] text-white"
        >
          {tok.slice(1, -1)}
        </code>,
      );
    } else if (tok.startsWith("*") && tok.endsWith("*") && tok.length > 2) {
      nodes.push(
        <em key={k} className="italic">
          {renderCitations(tok.slice(1, -1), policy, ism, web, k)}
        </em>,
      );
    } else {
      nodes.push(...renderCitations(tok, policy, ism, web, k));
    }
  });
  return nodes;
}

function Markdown({
  text,
  policy,
  ism,
  web,
}: {
  text: string;
  policy: PolicySource[];
  ism: ISMSource[];
  web: WebSource[];
}) {
  const blocks = parseBlocks(text);
  return (
    <div className="space-y-2">
      {blocks.map((b, i) => {
        if (b.type === "heading") {
          const cls =
            b.level <= 2
              ? "mt-3 mb-1 text-[15px] font-bold text-white first:mt-0"
              : "mt-2 mb-0.5 text-sm font-bold text-white/95 first:mt-0";
          return (
            <p key={i} className={cls}>
              {renderInline(b.text, policy, ism, web, `h${i}`)}
            </p>
          );
        }
        if (b.type === "ul") {
          return (
            <ul
              key={i}
              className="ml-4 list-disc space-y-1 marker:text-white/40"
            >
              {b.items.map((it, j) => (
                <li key={j}>
                  {renderInline(it, policy, ism, web, `u${i}-${j}`)}
                </li>
              ))}
            </ul>
          );
        }
        if (b.type === "ol") {
          return (
            <ol
              key={i}
              className="ml-4 list-decimal space-y-1 marker:text-white/40"
            >
              {b.items.map((it, j) => (
                <li key={j}>
                  {renderInline(it, policy, ism, web, `o${i}-${j}`)}
                </li>
              ))}
            </ol>
          );
        }
        if (b.type === "table") {
          return (
            <div key={i} className="my-2 overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr>
                    {b.header.map((h, j) => (
                      <th
                        key={j}
                        className="border border-white/15 bg-white/10 px-2 py-1.5 text-left font-semibold text-white"
                      >
                        {renderInline(h, policy, ism, web, `th${i}-${j}`)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {b.rows.map((row, ri) => (
                    <tr key={ri}>
                      {row.map((cell, ci) => (
                        <td
                          key={ci}
                          className="border border-white/10 px-2 py-1.5 align-top text-white/85"
                        >
                          {renderInline(cell, policy, ism, web, `td${i}-${ri}-${ci}`)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        if (b.type === "hr") {
          return <hr key={i} className="my-2 border-white/10" />;
        }
        return (
          <p key={i} className="leading-relaxed">
            {renderInline(b.text, policy, ism, web, `p${i}`)}
          </p>
        );
      })}
    </div>
  );
}

function SourcesPanel({
  policy,
  ism,
  web,
}: {
  policy: PolicySource[];
  ism: ISMSource[];
  web: WebSource[];
}) {
  if (policy.length === 0 && ism.length === 0 && web.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-white/15 p-4 text-center text-xs text-white/50">
        Cited excerpts will appear here after the AI answers
      </div>
    );
  }
  const srcCard =
    "block rounded-xl border border-white/15 p-3 transition hover:-translate-y-0.5 hover:border-white/30";
  const srcStyle = {
    background: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(8px)",
  } as const;
  return (
    <div className="space-y-5">
      {policy.length > 0 && (
        <div>
          <div className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-white/55">
            <BookOpen className="h-3 w-3" /> Policy excerpts
          </div>
          <ol className="space-y-2">
            {policy.map((s) => (
              <li key={s.n}>
                <Link
                  href={`/policies/${s.policy_id}`}
                  className={srcCard}
                  style={srcStyle}
                >
                  <div className="flex items-center gap-2">
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded bg-white/15 text-[10px] font-bold text-white">
                      {s.n}
                    </span>
                    <span className="text-xs font-semibold text-white">
                      {s.country}
                    </span>
                    {s.year && (
                      <span className="text-[10px] text-white/55">
                        {s.year}
                      </span>
                    )}
                    <ExternalLink className="ml-auto h-3 w-3 text-white/50" />
                  </div>
                  <div className="mt-1 line-clamp-1 text-xs font-semibold text-white/85">
                    {s.title}
                  </div>
                  <div className="mt-1.5 line-clamp-3 text-[11px] leading-snug text-white/65">
                    {s.snippet}
                  </div>
                  <div className="mt-1.5 text-[10px] text-white/45">
                    Similarity {(s.score * 100).toFixed(1)}%
                  </div>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      )}
      {ism.length > 0 && (
        <div>
          <div className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-300/80">
            <Layers3 className="h-3 w-3" /> ISM structured data
          </div>
          <ol className="space-y-2">
            {ism.map((s) => (
              <li key={s.n}>
                <div className={srcCard} style={srcStyle}>
                  <div className="flex items-center gap-2">
                    <span className="grid h-5 shrink-0 place-items-center rounded bg-amber-400/20 px-1 text-[10px] font-bold text-amber-200">
                      I{s.n}
                    </span>
                    <span className="text-xs font-semibold text-white">
                      {s.country}
                    </span>
                    {s.year && (
                      <span className="text-[10px] text-white/55">{s.year}</span>
                    )}
                  </div>
                  {s.lead_authority && (
                    <div className="mt-1 line-clamp-1 text-[11px] font-semibold text-white/85">
                      {s.lead_authority}
                    </div>
                  )}
                  <div className="mt-1.5 line-clamp-3 text-[11px] leading-snug text-white/65">
                    {s.snippet}
                  </div>
                  <div className="mt-1.5 text-[10px] text-white/45">
                    PRISM ISM · Similarity {(s.score * 100).toFixed(1)}%
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
      {web.length > 0 && (
        <div>
          <div className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300/80">
            <Globe className="h-3 w-3" /> Web results
          </div>
          <ol className="space-y-2">
            {web.map((s) => (
              <li key={s.n}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={srcCard}
                  style={srcStyle}
                >
                  <div className="flex items-center gap-2">
                    <span className="grid h-5 shrink-0 place-items-center rounded bg-emerald-400/20 px-1 text-[10px] font-bold text-emerald-200">
                      W{s.n}
                    </span>
                    <span className="line-clamp-1 text-xs font-semibold text-white">
                      {s.title}
                    </span>
                    <ExternalLink className="ml-auto h-3 w-3 text-white/50" />
                  </div>
                  <div className="mt-1 line-clamp-1 text-[10px] text-white/55">
                    {(() => {
                      try {
                        return new URL(s.url).hostname;
                      } catch {
                        return s.url;
                      }
                    })()}
                  </div>
                  <div className="mt-1.5 line-clamp-3 text-[11px] leading-snug text-white/65">
                    {s.snippet}
                  </div>
                </a>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

export function ChatHeaderBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold text-white">
      <FileText className="h-3 w-3" /> {children}
    </span>
  );
}
