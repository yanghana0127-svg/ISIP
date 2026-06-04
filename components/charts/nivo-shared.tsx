"use client";

import { useEffect, useState } from "react";

// nivo Responsive* charts measure their container on the client only — render
// nothing on the server / first paint to avoid hydration mismatch.
export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

// navy-on-light theme to match the home / countries glass UI
export const nivoTheme = {
  text: { fontSize: 11, fill: "#19376d" },
  axis: {
    ticks: { text: { fontSize: 10, fill: "#3e5896" } },
    legend: { text: { fontSize: 11, fill: "#19376d", fontWeight: 600 } },
  },
  grid: { line: { stroke: "rgba(11,36,71,0.08)" } },
  legends: { text: { fontSize: 11, fill: "#19376d" } },
  tooltip: {
    container: {
      background: "rgba(255,255,255,0.95)",
      color: "#0b2447",
      fontSize: 12,
      borderRadius: 10,
      boxShadow: "0 8px 24px rgba(11,36,71,0.18)",
    },
  },
} as const;

// sequential navy ramp for choropleth / heatmap
export const NAVY_RAMP = [
  "#dbe3f4",
  "#b4c4dd",
  "#7c91d6",
  "#576cbc",
  "#36497a",
  "#19376d",
  "#0b2447",
];

// shared categorical navy palette — matches the "Legislative activity by
// decade" chart; reused by the sub-sector donut for site-wide consistency
export const NAVY_CATEGORY = [
  "#19376d",
  "#576cbc",
  "#7d8fbf",
  "#4f6a9b",
  "#9fb3d6",
  "#36497a",
  "#2c4a78",
  "#b4c4dd",
];

// the same family ordered light → dark, for sequential scales (heatmap)
export const NAVY_SEQ = [
  "#b4c4dd",
  "#9fb3d6",
  "#7d8fbf",
  "#576cbc",
  "#4f6a9b",
  "#36497a",
  "#2c4a78",
  "#19376d",
];

// distinct teal/cyan ramp so the "Strictness" map metric reads differently
// from the navy "Mechanisms" ramp
export const TEAL_RAMP = [
  "#e0f3f6",
  "#b8e4ea",
  "#7fcdd8",
  "#45b0c0",
  "#2b8b9f",
  "#1f6f8b",
  "#124a5e",
];

// continuous CSS gradient string from a ramp, for HTML color legends
export function rampGradient(ramp: readonly string[]): string {
  return `linear-gradient(90deg, ${ramp.join(", ")})`;
}

// shared recharts tooltip style (keeps recharts charts consistent with nivo)
export const RECHARTS_TOOLTIP = {
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.6)",
  background: "rgba(255,255,255,0.96)",
  fontSize: 12,
  boxShadow: "0 8px 24px rgba(11,36,71,0.18)",
} as const;

// single-hue navy → light sequential ramp of n steps (premium, consistent
// with the rest of the palette — avoids rainbow pie/heatmap colours)
export function navyScale(n: number): string[] {
  if (n <= 1) return ["#2c4a8a"];
  return Array.from({ length: n }, (_, i) => {
    const l = 26 + (i / (n - 1)) * 42; // lightness 26%→68%
    return `hsl(214, 46%, ${l}%)`;
  });
}

// neutral chart loading placeholder — keeps the card height stable (no text jump)
export function ChartSkeleton() {
  return (
    <div className="grid h-full w-full place-items-center">
      <div className="h-full w-full animate-pulse rounded-xl bg-navy-mid/[0.06]" />
    </div>
  );
}

export function ChartCard({
  title,
  subtitle,
  right,
  children,
  className = "",
}: {
  title?: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`glass rounded-2xl p-5 ${className}`}>
      {(title || right) && (
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            {title && (
              <h3 className="text-sm font-bold text-navy-dark">{title}</h3>
            )}
            {subtitle && (
              <p className="mt-0.5 text-xs text-navy-mid/70">{subtitle}</p>
            )}
          </div>
          {right}
        </div>
      )}
      {children}
    </div>
  );
}
