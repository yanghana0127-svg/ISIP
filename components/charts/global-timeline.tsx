"use client";

import { useMemo } from "react";
import { ResponsiveLine } from "@nivo/line";
import type { ISMYearly } from "@/lib/types";
import { useMounted, nivoTheme , ChartSkeleton } from "./nivo-shared";

// Global wave of new screening mechanisms per year (the post-2018 / COVID surge).
export function GlobalTimeline({
  yearly,
  from = 1995,
}: {
  yearly: ISMYearly[];
  from?: number;
}) {
  const mounted = useMounted();

  const { series, peak } = useMemo(() => {
    const perYear = new Map<number, number>();
    for (const y of yearly) {
      if (y.year >= from) perYear.set(y.year, (perYear.get(y.year) ?? 0) + y.totalNew);
    }
    const years = Array.from(perYear.keys()).sort((a, b) => a - b);
    if (years.length === 0) return { series: [], peak: null as null | number };
    const minY = years[0];
    const maxY = years[years.length - 1];
    let cum = 0;
    const newPts: { x: number; y: number }[] = [];
    const cumPts: { x: number; y: number }[] = [];
    let peakYear = minY;
    let peakVal = 0;
    for (let yr = minY; yr <= maxY; yr++) {
      const v = perYear.get(yr) ?? 0;
      cum += v;
      newPts.push({ x: yr, y: v });
      cumPts.push({ x: yr, y: cum });
      if (v > peakVal) {
        peakVal = v;
        peakYear = yr;
      }
    }
    return {
      series: [
        { id: "New per year", data: newPts },
        { id: "Cumulative", data: cumPts },
      ],
      peak: peakYear,
    };
  }, [yearly, from]);

  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-3">
        <h3 className="text-sm font-bold text-navy-dark">
          The global tightening wave
        </h3>
        <p className="text-xs text-navy-mid/70">
          New screening mechanisms enacted worldwide per year
          {peak ? ` · peak in ${peak}` : ""}
        </p>
      </div>
      <div className="h-64 w-full">
        {mounted && series.length > 0 ? (
          <ResponsiveLine
            data={series}
            theme={nivoTheme}
            margin={{ top: 10, right: 16, bottom: 40, left: 40 }}
            xScale={{ type: "linear", min: "auto", max: "auto" }}
            yScale={{ type: "linear", min: 0, max: "auto" }}
            curve="monotoneX"
            colors={["#19376d", "#9fb3d6"]}
            enablePoints={false}
            enableArea
            areaOpacity={0.12}
            enableGridX={false}
            axisBottom={{ tickValues: 6, format: (v) => `${v}` }}
            axisLeft={{ tickValues: 5 }}
            useMesh
            legends={[
              {
                anchor: "top-left",
                direction: "row",
                translateY: -4,
                itemWidth: 110,
                itemHeight: 16,
                symbolSize: 10,
                itemTextColor: "#3e5896",
              },
            ]}
          />
        ) : (
          <ChartSkeleton />
        )}
      </div>
    </div>
  );
}
