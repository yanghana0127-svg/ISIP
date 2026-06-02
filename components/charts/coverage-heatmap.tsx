"use client";

import { useMemo } from "react";
import { ResponsiveHeatMap } from "@nivo/heatmap";
import type { ISMCountry } from "@/lib/types";
import { useMounted, nivoTheme } from "./nivo-shared";

// Country × sector-group coverage matrix (the analytical centerpiece).
export function CoverageHeatmap({
  countries,
  groups,
  topN = 24,
}: {
  countries: ISMCountry[];
  groups: string[];
  topN?: number;
}) {
  const mounted = useMounted();

  const data = useMemo(() => {
    const top = [...countries]
      .sort((a, b) => b.totalSectors - a.totalSectors)
      .slice(0, topN);
    return top.map((c) => ({
      id: c.country,
      data: groups.map((g) => ({ x: g, y: c.groups?.[g] ?? 0 })),
    }));
  }, [countries, groups, topN]);

  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-3">
        <h3 className="text-sm font-bold text-navy-dark">
          Which sectors each country screens
        </h3>
        <p className="text-xs text-navy-mid/70">
          Number of covered sub-sectors per high-level group · top {data.length}{" "}
          countries by breadth
        </p>
      </div>
      <div className="h-[560px] w-full">
        {mounted && data.length > 0 ? (
          <ResponsiveHeatMap
            data={data}
            theme={nivoTheme}
            margin={{ top: 70, right: 20, bottom: 20, left: 120 }}
            valueFormat=">-.0f"
            axisTop={{
              tickSize: 0,
              tickPadding: 8,
              tickRotation: -38,
            }}
            axisLeft={{ tickSize: 0, tickPadding: 6 }}
            colors={{
              type: "sequential",
              scheme: "blues",
              minValue: 0,
            }}
            emptyColor="#eef2fa"
            borderColor="#ffffff"
            borderWidth={2}
            labelTextColor={{ from: "color", modifiers: [["darker", 2.4]] }}
            hoverTarget="cell"
            animate={false}
          />
        ) : (
          <div className="grid h-full place-items-center text-sm text-navy-mid/50">
            Loading…
          </div>
        )}
      </div>
    </div>
  );
}
