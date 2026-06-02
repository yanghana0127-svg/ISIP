"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import type { PolicyMeta } from "@/lib/types";

const PALETTE = [
  "#19376d",
  "#576cbc",
  "#7d8fbf",
  "#4f6a9b",
  "#9fb3d6",
  "#36497a",
  "#2c4a78",
  "#b4c4dd",
];

const TOOLTIP_STYLE = {
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.6)",
  background: "rgba(255,255,255,0.92)",
  backdropFilter: "blur(10px)",
  fontSize: 12,
};

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-3">
        <h3 className="text-sm font-bold text-navy-dark">{title}</h3>
        {subtitle && (
          <p className="mt-0.5 text-xs text-navy-mid/70">{subtitle}</p>
        )}
      </div>
      <div className="h-64 w-full">{children}</div>
    </div>
  );
}

export function CountryPolicyCountBar({
  policies,
  topN = 10,
}: {
  policies: PolicyMeta[];
  topN?: number;
}) {
  const counts: Record<string, number> = {};
  for (const p of policies) counts[p.country] = (counts[p.country] ?? 0) + 1;
  const data = Object.entries(counts)
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, topN);

  return (
    <ChartCard
      title="Which countries legislate the most in this sector"
      subtitle={`Top ${data.length} countries by policy count`}
    >
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{ top: 5, right: 8, left: -16, bottom: 4 }}
        >
          <defs>
            <linearGradient id="barNavy" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7c91d6" stopOpacity={1} />
              <stop offset="100%" stopColor="#0f2a55" stopOpacity={1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(11,36,71,0.08)" />
          <XAxis
            dataKey="country"
            tick={{ fontSize: 10, fill: "#19376d" }}
            interval={0}
            angle={-25}
            textAnchor="end"
            height={60}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 10, fill: "#19376d" }}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            cursor={{ fill: "rgba(25,55,109,0.06)" }}
          />
          <Bar dataKey="count" fill="url(#barNavy)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function PolicyTimelineArea({ policies }: { policies: PolicyMeta[] }) {
  const yearCount: Record<number, number> = {};
  for (const p of policies) {
    if (p.year && p.year >= 1970 && p.year <= 2026) {
      yearCount[p.year] = (yearCount[p.year] ?? 0) + 1;
    }
  }
  const years = Object.keys(yearCount)
    .map(Number)
    .sort((a, b) => a - b);
  if (years.length === 0) {
    return (
      <ChartCard title="Policy timeline" subtitle="Issuance by year">
        <div className="grid h-full place-items-center text-sm text-navy-mid/60">
          No year information available
        </div>
      </ChartCard>
    );
  }
  const minY = Math.min(years[0], 1990);
  const maxY = Math.max(years[years.length - 1], new Date().getFullYear());
  const data: { year: number; count: number; cumulative: number }[] = [];
  let cum = 0;
  for (let y = minY; y <= maxY; y++) {
    const c = yearCount[y] ?? 0;
    cum += c;
    data.push({ year: y, count: c, cumulative: cum });
  }

  return (
    <ChartCard
      title="When were these policies enacted"
      subtitle="New per year and cumulative total"
    >
      <ResponsiveContainer>
        <AreaChart
          data={data}
          margin={{ top: 5, right: 8, left: -16, bottom: 0 }}
        >
          <defs>
            <linearGradient id="cumGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#576cbc" stopOpacity={0.55} />
              <stop offset="100%" stopColor="#576cbc" stopOpacity={0.04} />
            </linearGradient>
            <linearGradient id="newGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#19376d" stopOpacity={0.7} />
              <stop offset="100%" stopColor="#19376d" stopOpacity={0.08} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(11,36,71,0.08)" />
          <XAxis dataKey="year" tick={{ fontSize: 10, fill: "#19376d" }} />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 10, fill: "#19376d" }}
          />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Area
            type="monotone"
            dataKey="cumulative"
            name="Cumulative"
            stroke="#576cbc"
            fill="url(#cumGrad)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="count"
            name="New per year"
            stroke="#19376d"
            fill="url(#newGrad)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function FormatPie({ policies }: { policies: PolicyMeta[] }) {
  const counts: Record<string, number> = {};
  for (const p of policies)
    counts[p.source_type] = (counts[p.source_type] ?? 0) + 1;
  const data = Object.entries(counts).map(([name, value]) => ({
    name: name.toUpperCase(),
    value,
  }));
  return (
    <ChartCard
      title="Source format"
      subtitle="Distribution of policy file formats"
    >
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={88}
            paddingAngle={4}
            dataKey="value"
            label={(d) => `${d.name} ${d.value}`}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={TOOLTIP_STYLE} />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function CountryDecadeStack({
  policies,
  topN = 8,
}: {
  policies: PolicyMeta[];
  topN?: number;
}) {
  const decadeOf = (y: number | null): string => {
    if (!y) return "Unknown";
    const d = Math.floor(y / 10) * 10;
    return `${d}s`;
  };
  const countryTotal: Record<string, number> = {};
  for (const p of policies)
    countryTotal[p.country] = (countryTotal[p.country] ?? 0) + 1;
  const topCountries = Object.entries(countryTotal)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([c]) => c);

  const decadeSet = new Set<string>();
  const matrix: Record<string, Record<string, number>> = {};
  for (const p of policies) {
    if (!topCountries.includes(p.country)) continue;
    const d = decadeOf(p.year);
    decadeSet.add(d);
    (matrix[p.country] ??= {})[d] = (matrix[p.country]?.[d] ?? 0) + 1;
  }
  const decades = Array.from(decadeSet).sort();
  const data = topCountries.map((country) => {
    const row: Record<string, number | string> = { country };
    for (const d of decades) row[d] = matrix[country]?.[d] ?? 0;
    return row;
  });

  return (
    <ChartCard
      title="Legislative activity by decade"
      subtitle={`Top ${topCountries.length} countries, stacked by decade`}
    >
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{ top: 5, right: 8, left: -16, bottom: 4 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(11,36,71,0.08)" />
          <XAxis
            dataKey="country"
            tick={{ fontSize: 10, fill: "#19376d" }}
            interval={0}
            angle={-25}
            textAnchor="end"
            height={60}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 10, fill: "#19376d" }}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            cursor={{ fill: "rgba(25,55,109,0.06)" }}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {decades.map((d, i) => (
            <Bar
              key={d}
              dataKey={d}
              stackId="a"
              fill={PALETTE[i % PALETTE.length]}
              radius={i === decades.length - 1 ? [6, 6, 0, 0] : 0}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
