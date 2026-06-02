"use client";

import { useMemo } from "react";
import { ResponsiveBar } from "@nivo/bar";
import type { ISMCountry } from "@/lib/types";
import { useMounted, nivoTheme } from "./nivo-shared";

// Top countries by the Screening Strictness Index.
export function StrictnessRank({
  countries,
  topN = 15,
  highlightSlug,
}: {
  countries: ISMCountry[];
  topN?: number;
  highlightSlug?: string;
}) {
  const mounted = useMounted();

  const data = useMemo(
    () =>
      [...countries]
        .sort((a, b) => b.strictness - a.strictness)
        .slice(0, topN)
        .reverse()
        .map((c) => ({
          country: c.country,
          slug: c.slug,
          strictness: c.strictness,
        })),
    [countries, topN],
  );

  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-3">
        <h3 className="text-sm font-bold text-navy-dark">
          Screening Strictness Index
        </h3>
        <p className="text-xs text-navy-mid/70">
          0–100 composite of mechanism features + sector breadth · top {topN}
        </p>
      </div>
      <div className="h-[460px] w-full">
        {mounted && data.length > 0 ? (
          <ResponsiveBar
            data={data}
            theme={nivoTheme}
            keys={["strictness"]}
            indexBy="country"
            layout="horizontal"
            margin={{ top: 4, right: 30, bottom: 30, left: 110 }}
            padding={0.28}
            valueScale={{ type: "linear" }}
            colors={(d) =>
              (d.data as { slug: string }).slug === highlightSlug
                ? "#5ad7e8"
                : "#3a5391"
            }
            borderRadius={3}
            axisBottom={{ tickValues: 5 }}
            axisLeft={{ tickSize: 0, tickPadding: 6 }}
            enableGridX
            enableGridY={false}
            labelSkipWidth={20}
            label={(d) => `${d.value}`}
            labelTextColor="#ffffff"
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
