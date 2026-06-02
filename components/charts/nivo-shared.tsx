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
