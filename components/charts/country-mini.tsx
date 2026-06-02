"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import type { ISMPanel } from "@/lib/types";

const TOOLTIP_STYLE = {
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.6)",
  background: "rgba(255,255,255,0.95)",
  fontSize: 12,
} as const;

// Country's policy mix across the 7 ISIP sectors.
export function IndustryDonut({
  mix,
}: {
  mix: { slug: string; name: string; color: string; count: number }[];
}) {
  if (mix.length === 0) {
    return (
      <div className="grid h-full place-items-center text-sm text-navy-mid/50">
        No sector-tagged policies
      </div>
    );
  }
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={mix}
          cx="50%"
          cy="50%"
          innerRadius={52}
          outerRadius={90}
          paddingAngle={3}
          dataKey="count"
          label={(d) => `${(d as unknown as { count: number }).count}`}
        >
          {mix.map((m) => (
            <Cell key={m.slug} fill={m.color} stroke="rgba(255,255,255,0.6)" />
          ))}
        </Pie>
        <Tooltip contentStyle={TOOLTIP_STYLE} />
      </PieChart>
    </ResponsiveContainer>
  );
}

// Strictness Index over time for one country.
export function StrictnessTrend({ panel }: { panel: ISMPanel[] }) {
  const data = panel.map((p) => ({ year: p.year, strictness: p.strictness }));
  if (data.length < 2) {
    return (
      <div className="grid h-full place-items-center text-sm text-navy-mid/50">
        Not enough yearly data
      </div>
    );
  }
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="strictLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#7c91d6" />
            <stop offset="100%" stopColor="#0f2a55" />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(11,36,71,0.08)" />
        <XAxis dataKey="year" tick={{ fontSize: 10, fill: "#19376d" }} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#19376d" }} />
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Line
          type="monotone"
          dataKey="strictness"
          stroke="url(#strictLine)"
          strokeWidth={2.5}
          dot={{ r: 2.5, fill: "#19376d" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
