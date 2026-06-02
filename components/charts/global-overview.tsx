"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Link from "next/link";
import type { Country, Industry } from "@/lib/types";

// Refined industry palette — cohesive cool tones, no saturated gold/green
const INDUSTRY_TONES: Record<string, { from: string; to: string }> = {
  "defense-security": { from: "#1e3658", to: "#0b2447" },
  "semiconductor-computing": { from: "#5b6db8", to: "#344b8a" },
  "energy-resources": { from: "#3d8aa8", to: "#1a5a7a" },
  "telecom-data": { from: "#6889c4", to: "#3e5896" },
  "transport-logistics": { from: "#7d8fbf", to: "#4f6a9b" },
  "bio-medical": { from: "#8a76b8", to: "#5d4a8c" },
  "finance-property": { from: "#9a8eb5", to: "#6e6088" },
};

export function GlobalOverview({
  countries,
  industries,
}: {
  countries: Country[];
  industries: Industry[];
}) {
  const topCountries = [...countries]
    .sort((a, b) => b.policy_count - a.policy_count)
    .slice(0, 15);

  const industriesSorted = [...industries].sort(
    (a, b) => b.policy_count - a.policy_count,
  );

  return (
    <section className="grid gap-4 lg:grid-cols-5">
      {/* Country bar — wide */}
      <div className="glass rounded-2xl p-5 lg:col-span-3">
        <div className="mb-2">
          <h3 className="text-base font-bold text-navy-dark">
            哪些国家立法最活跃
          </h3>
          <p className="text-xs text-navy-mid/70">
            按政策数量排名前 15 的国家
          </p>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer>
            <BarChart
              data={topCountries.map((c) => ({
                name: c.name,
                count: c.policy_count,
              }))}
              margin={{ top: 5, right: 8, left: -16, bottom: 4 }}
            >
              <defs>
                <linearGradient id="ovGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#576cbc" stopOpacity={0.85} />
                  <stop offset="100%" stopColor="#19376d" stopOpacity={0.75} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(11,36,71,0.08)"
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 9, fill: "#19376d" }}
                interval={0}
                angle={-30}
                textAnchor="end"
                height={70}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 10, fill: "#19376d" }}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.6)",
                  background: "rgba(255,255,255,0.92)",
                  backdropFilter: "blur(10px)",
                  fontSize: 12,
                }}
                cursor={{ fill: "rgba(25,55,109,0.06)" }}
              />
              <Bar dataKey="count" fill="url(#ovGrad)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Industry distribution list with refined bars */}
      <div className="glass rounded-2xl p-5 lg:col-span-2">
        <div className="mb-4">
          <h3 className="text-base font-bold text-navy-dark">
            各行业的政策覆盖
          </h3>
          <p className="text-xs text-navy-mid/70">
            点击进入该行业查看详细对比
          </p>
        </div>
        <ul className="space-y-4">
          {industriesSorted.map((ind) => {
            const max = Math.max(
              ...industriesSorted.map((i) => i.policy_count),
            );
            const pct = max > 0 ? (ind.policy_count / max) * 100 : 0;
            const tone =
              INDUSTRY_TONES[ind.slug] ?? { from: "#576cbc", to: "#19376d" };
            return (
              <li key={ind.slug}>
                <Link href={`/industry/${ind.slug}`} className="group block">
                  <div className="mb-2 flex items-center gap-2">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full ring-2 ring-white/50"
                      style={{
                        background: `linear-gradient(135deg, ${tone.from}, ${tone.to})`,
                        boxShadow: `0 0 0 1px ${tone.to}40, 0 0 8px ${tone.to}55`,
                      }}
                    />
                    <span className="min-w-0 flex-1 truncate text-xs">
                      <span className="font-semibold text-navy-dark transition group-hover:text-navy-mid">
                        {ind.name_en}
                      </span>
                      <span className="ml-1.5 font-normal text-navy-mid/55">
                        {ind.name_zh}
                      </span>
                    </span>
                    <span className="shrink-0 font-mono text-[11px] tabular-nums text-navy-mid/70">
                      <span className="font-semibold text-navy-dark">
                        {ind.policy_count}
                      </span>
                      <span className="mx-0.5 text-navy-mid/40">/</span>
                      {ind.country_count}
                    </span>
                  </div>

                  {/* refined bar: track + gradient fill + glossy top highlight + end glow */}
                  <div
                    className="relative h-[5px] overflow-hidden rounded-full"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(11,36,71,0.06), rgba(11,36,71,0.02))",
                      boxShadow:
                        "inset 0 1px 1px rgba(11,36,71,0.06), inset 0 0 0 1px rgba(255,255,255,0.5)",
                    }}
                  >
                    <div
                      className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out group-hover:brightness-110"
                      style={{
                        width: `${pct}%`,
                        background: `linear-gradient(90deg, ${tone.from}00 0%, ${tone.from}cc 35%, ${tone.to} 100%)`,
                        boxShadow: `0 0 8px ${tone.to}55, inset 0 1px 0 rgba(255,255,255,0.35)`,
                      }}
                    >
                      {/* glossy top highlight */}
                      <div
                        className="absolute inset-x-0 top-0 h-px rounded-full"
                        style={{
                          background:
                            "linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent)",
                        }}
                      />
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
