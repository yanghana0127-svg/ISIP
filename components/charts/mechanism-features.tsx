"use client";

import { useMemo } from "react";
import { ResponsiveBar } from "@nivo/bar";
import type { ISMCountry } from "@/lib/types";
import { useMounted, nivoTheme , ChartSkeleton } from "./nivo-shared";

// How widely each screening-mechanism feature is adopted across countries.
// Replaces the low-signal sector-network graph with a directly readable ranking.
export function MechanismFeatures({
  countries,
  featureLabels,
}: {
  countries: ISMCountry[];
  featureLabels: Record<string, string>;
}) {
  const mounted = useMounted();
  const total = countries.length;

  const data = useMemo(() => {
    const rows = Object.entries(featureLabels).map(([key, label]) => ({
      feature: label,
      key,
      count: countries.filter((c) => c.features?.[key] === 1).length,
    }));
    return rows
      .sort((a, b) => a.count - b.count) // ascending → highest ends up on top
      .map((r) => ({
        ...r,
        pct: total ? Math.round((r.count / total) * 100) : 0,
      }));
  }, [countries, featureLabels, total]);

  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-3">
        <h3 className="text-sm font-bold text-navy-dark">
          Mechanism features adoption
        </h3>
        <p className="text-xs text-navy-mid/70">
          How many of the {total} ISM countries build each feature into their
          screening regime
        </p>
      </div>
      <div className="h-[360px] w-full sm:h-[460px]">
        {mounted && data.length > 0 ? (
          <ResponsiveBar
            data={data}
            theme={nivoTheme}
            keys={["count"]}
            indexBy="feature"
            layout="horizontal"
            margin={{ top: 4, right: 48, bottom: 30, left: 210 }}
            padding={0.3}
            valueScale={{ type: "linear" }}
            colors="#3a5391"
            defs={[
              {
                id: "featGrad",
                type: "linearGradient",
                x1: 0,
                y1: 0,
                x2: 1,
                y2: 0,
                colors: [
                  { offset: 0, color: "#aebfe2" },
                  { offset: 55, color: "#4a63a8" },
                  { offset: 100, color: "#0b2447" },
                ],
              },
            ]}
            fill={[{ match: "*", id: "featGrad" }]}
            borderRadius={3}
            axisBottom={{ tickValues: 5 }}
            axisLeft={{ tickSize: 0, tickPadding: 6 }}
            enableGridX
            enableGridY={false}
            labelSkipWidth={28}
            label={(d) => {
              const row = d.data as { pct: number };
              return `${d.value} · ${row.pct}%`;
            }}
            labelTextColor="#ffffff"
            tooltip={({ data: d }) => {
              const row = d as unknown as {
                feature: string;
                count: number;
                pct: number;
              };
              return (
                <div className="rounded-lg bg-navy-dark px-2.5 py-1.5 text-xs text-white shadow-lg">
                  <div className="font-semibold">{row.feature}</div>
                  <div className="text-white/75">
                    {row.count} of {total} countries · {row.pct}%
                  </div>
                </div>
              );
            }}
          />
        ) : (
          <ChartSkeleton />
        )}
      </div>
    </div>
  );
}
