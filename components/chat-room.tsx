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

type Message = {
  role: "user" | "assistant";
  content: string;
  mode?: Mode;
  policySources?: PolicySource[];
  webSources?: WebSource[];
};

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
}: {
  industry?: string;
  country?: string;
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

  async function send(text: string) {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: "user", content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);

    setMessages((m) => [
      ...m,
      { role: "assistant", content: "", mode, policySources: [], webSources: [] },
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
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = {
          role: "assistant",
          content: `Error: ${String(e)}`,
        };
        return copy;
      });
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void send(input);
  }

  const latestAssistant = [...messages]
    .reverse()
    .find((m) => m.role === "assistant");

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      {/* Main column: composer pinned on top, messages scroll below — one card */}
      <div
        className="flex flex-col overflow-hidden rounded-2xl border border-white/15"
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
              className="block min-h-[52px] w-full resize-none border-0 bg-transparent text-base text-white placeholder:text-white/40 outline-none"
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
          className="min-h-[420px] flex-1 space-y-4 overflow-y-auto p-5"
          style={{ maxHeight: "60vh" }}
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
            />
          ))}
        </div>
      </div>

      {/* Sidebar: sources — dark glass */}
      <aside
        className="max-h-[78vh] min-h-[200px] overflow-y-auto rounded-2xl border border-white/15 p-5"
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
          web={latestAssistant?.webSources ?? []}
        />
      </aside>
    </div>
  );
}

function MessageBubble({
  msg,
  streaming,
}: {
  msg: Message;
  streaming?: boolean;
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
        {msg.content ? (
          <Markdown
            text={msg.content}
            policy={msg.policySources ?? []}
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
  | { type: "hr" }
  | { type: "p"; text: string };

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

  for (const raw of src.split("\n")) {
    const line = raw.trim();
    if (!line) {
      flushPara();
      flushList();
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
  web: WebSource[],
  keyPrefix: string,
): React.ReactNode[] {
  const parts = text.split(/(\[(?:W\d+|\d+)\](?:\[(?:W\d+|\d+)\])*)/g);
  return parts.map((part, i) => {
    if (part && /^(\[(?:W?\d+)\])+$/.test(part)) {
      const matches = part.match(/\[(W?\d+)\]/g) ?? [];
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
          {renderCitations(tok.slice(2, -2), policy, web, k)}
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
          {renderCitations(tok.slice(1, -1), policy, web, k)}
        </em>,
      );
    } else {
      nodes.push(...renderCitations(tok, policy, web, k));
    }
  });
  return nodes;
}

function Markdown({
  text,
  policy,
  web,
}: {
  text: string;
  policy: PolicySource[];
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
              {renderInline(b.text, policy, web, `h${i}`)}
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
                <li key={j}>{renderInline(it, policy, web, `u${i}-${j}`)}</li>
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
                <li key={j}>{renderInline(it, policy, web, `o${i}-${j}`)}</li>
              ))}
            </ol>
          );
        }
        if (b.type === "hr") {
          return <hr key={i} className="my-2 border-white/10" />;
        }
        return (
          <p key={i} className="leading-relaxed">
            {renderInline(b.text, policy, web, `p${i}`)}
          </p>
        );
      })}
    </div>
  );
}

function SourcesPanel({
  policy,
  web,
}: {
  policy: PolicySource[];
  web: WebSource[];
}) {
  if (policy.length === 0 && web.length === 0) {
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
