"use client";

import { useEffect, useState, useTransition } from "react";
import { Search, Loader2, X } from "lucide-react";
import { PolicyCard } from "./policy-card";
import type { PolicyMeta, Industry, Country } from "@/lib/types";

export function SearchBar({
  countries,
  industries,
  initialResults,
}: {
  countries: Country[];
  industries: Industry[];
  initialResults: PolicyMeta[];
}) {
  const [q, setQ] = useState("");
  const [country, setCountry] = useState("");
  const [industry, setIndustry] = useState("");
  const [results, setResults] = useState<PolicyMeta[]>(initialResults);
  const [total, setTotal] = useState(initialResults.length);
  const [loading, startTransition] = useTransition();
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (country) params.set("country", country);
      if (industry) params.set("industry", industry);
      params.set("limit", "120");

      startTransition(async () => {
        const res = await fetch(`/api/search?${params.toString()}`);
        const json = await res.json();
        setResults(json.results);
        setTotal(json.total);
      });
    }, 250);
    return () => clearTimeout(t);
  }, [q, country, industry]);

  return (
    <div className="space-y-5">
      <div className="glass rounded-2xl p-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-mid" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜索政策标题、国家、关键词…（例：China semiconductor、CFIUS、national security）"
            className="w-full rounded-xl border border-white/60 bg-white/40 py-2.5 pl-9 pr-10 text-sm text-navy-dark placeholder:text-navy-mid/50 outline-none backdrop-blur transition focus:border-navy-soft focus:bg-white/70 focus:ring-2 focus:ring-navy-soft/30"
          />
          {q && (
            <button
              onClick={() => setQ("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-mid hover:text-navy-dark"
              aria-label="清空"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => setShowAdvanced((v) => !v)}
            className="rounded-lg border border-white/60 bg-white/40 px-3 py-1 font-semibold text-navy-mid backdrop-blur transition hover:bg-white/70"
          >
            {showAdvanced ? "收起筛选" : "高级筛选"}
          </button>
          <div className="ml-auto flex items-center gap-2 text-navy-mid/80">
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <span>
              共 <strong className="text-navy-dark">{total}</strong> 条结果
            </span>
          </div>
        </div>
        {showAdvanced && (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="rounded-xl border border-white/60 bg-white/50 px-3 py-2 text-sm text-navy-dark backdrop-blur"
            >
              <option value="">所有国家</option>
              {countries.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name} ({c.policy_count})
                </option>
              ))}
            </select>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="rounded-xl border border-white/60 bg-white/50 px-3 py-2 text-sm text-navy-dark backdrop-blur"
            >
              <option value="">所有行业</option>
              {industries.map((i) => (
                <option key={i.slug} value={i.slug}>
                  {i.name_zh} ({i.policy_count})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((p) => (
          <PolicyCard key={p.id} policy={p} highlight={q} />
        ))}
        {results.length === 0 && (
          <div className="glass-soft col-span-full rounded-2xl p-12 text-center text-sm text-navy-mid/70">
            没有匹配结果，试试别的关键词
          </div>
        )}
      </div>
    </div>
  );
}
