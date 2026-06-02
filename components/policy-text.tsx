"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";

export function PolicyText({ text, initialQuery = "" }: { text: string; initialQuery?: string }) {
  const [q, setQ] = useState(initialQuery);

  const rendered = useMemo(() => {
    if (!q.trim()) return text;
    const terms = q.split(/\s+/).filter(Boolean);
    if (!terms.length) return text;
    const escaped = terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    const re = new RegExp(`(${escaped.join("|")})`, "gi");
    return text.split(re);
  }, [text, q]);

  return (
    <div className="space-y-3">
      <div className="sticky top-24 z-20 -mx-2 px-2">
        <div className="glass rounded-2xl p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-mid" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="在原文中查找…"
              className="w-full rounded-xl border border-white/60 bg-white/40 py-2 pl-9 pr-9 text-sm text-navy-dark placeholder:text-navy-mid/50 outline-none backdrop-blur transition focus:border-navy-soft focus:bg-white/70 focus:ring-2 focus:ring-navy-soft/30"
            />
            {q && (
              <button
                onClick={() => setQ("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-mid hover:text-navy-dark"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <pre className="glass whitespace-pre-wrap break-words rounded-2xl p-6 font-sans text-sm leading-relaxed text-[#1a2c46]">
        {typeof rendered === "string"
          ? rendered
          : rendered.map((part, i) =>
              i % 2 === 1 ? (
                <mark key={i} className="highlight-hit">
                  {part}
                </mark>
              ) : (
                <span key={i}>{part}</span>
              ),
            )}
      </pre>
    </div>
  );
}
