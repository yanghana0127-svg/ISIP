"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, ArrowUpDown } from "lucide-react";
import type { CountryListItem } from "@/lib/types";

type Sort = "name" | "strictness" | "policies";

function StrictnessDot({ value }: { value: number | null }) {
  if (value == null) return null;
  const hue = 210; // navy
  const light = 78 - (value / 100) * 42; // darker = stricter
  return (
    <span
      className="inline-block h-2 w-2 rounded-full"
      style={{ background: `hsl(${hue} 55% ${light}%)` }}
    />
  );
}

export function CountryGrid({ list }: { list: CountryListItem[] }) {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<Sort>("strictness");

  const shown = useMemo(() => {
    const f = list.filter((c) =>
      c.name.toLowerCase().includes(q.trim().toLowerCase()),
    );
    f.sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "policies") return b.policyCount - a.policyCount;
      return (b.strictness ?? -1) - (a.strictness ?? -1);
    });
    return f;
  }, [list, q, sort]);

  const sorts: { id: Sort; label: string }[] = [
    { id: "strictness", label: "Strictness" },
    { id: "policies", label: "Policies" },
    { id: "name", label: "A–Z" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-mid/50" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search countries…"
            className="glass w-full rounded-xl py-2.5 pl-9 pr-3 text-sm text-navy-dark outline-none placeholder:text-navy-mid/50"
          />
        </div>
        <div className="inline-flex items-center gap-1 rounded-xl border border-white/40 bg-white/40 p-1 text-xs backdrop-blur">
          <ArrowUpDown className="ml-1 h-3.5 w-3.5 text-navy-mid/60" />
          {sorts.map((s) => (
            <button
              key={s.id}
              onClick={() => setSort(s.id)}
              className={`rounded-lg px-3 py-1.5 font-semibold transition ${
                sort === s.id
                  ? "bg-white text-navy-dark shadow-sm"
                  : "text-navy-mid/70 hover:text-navy-dark"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((c) => (
          <Link
            key={c.slug}
            href={`/countries/${c.slug}`}
            className="glass-soft group rounded-2xl p-4 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="truncate text-sm font-bold text-navy-dark">
                  {c.name}
                </div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {c.oecd && <Tag>OECD</Tag>}
                  {c.eu && <Tag>EU/EEA</Tag>}
                  {c.fiveEyes && <Tag>Five Eyes</Tag>}
                  {!c.hasISM && <Tag muted>policies only</Tag>}
                </div>
              </div>
              {c.strictness != null && (
                <div className="shrink-0 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <StrictnessDot value={c.strictness} />
                    <span className="font-mono text-base font-bold text-navy-dark">
                      {c.strictness.toFixed(0)}
                    </span>
                  </div>
                  <div className="text-[10px] text-navy-mid/55">
                    #{c.strictnessRank} strictness
                  </div>
                </div>
              )}
            </div>
            <div className="mt-3 flex items-center gap-3 text-[11px] text-navy-mid/70">
              <span>
                <b className="text-navy-dark">{c.policyCount}</b> policies
              </span>
              {c.mechanisms != null && (
                <span>
                  <b className="text-navy-dark">{c.mechanisms}</b> mechanisms
                </span>
              )}
              {c.totalSectors != null && (
                <span>
                  <b className="text-navy-dark">{c.totalSectors}</b> sectors
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
      {shown.length === 0 && (
        <div className="glass-soft rounded-2xl p-10 text-center text-sm text-navy-mid/60">
          No countries match “{q}”
        </div>
      )}
    </div>
  );
}

function Tag({
  children,
  muted,
}: {
  children: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <span
      className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
        muted
          ? "bg-navy-mid/10 text-navy-mid/60"
          : "bg-navy-soft/15 text-navy-mid"
      }`}
    >
      {children}
    </span>
  );
}
