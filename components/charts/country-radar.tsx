"use client";

import { useMemo } from "react";
import { ResponsiveRadar } from "@nivo/radar";
import type { ISMCountry } from "@/lib/types";
import { useMounted, nivoTheme , ChartSkeleton } from "./nivo-shared";

// Country sector-coverage profile vs the OECD average across the 8 groups.
export function CountryRadar({
  country,
  countries,
  groups,
}: {
  country: ISMCountry;
  countries: ISMCountry[];
  groups: string[];
}) {
  const mounted = useMounted();

  const data = useMemo(() => {
    const oecd = countries.filter((c) => c.oecd === 1);
    return groups.map((g) => {
      const avg =
        oecd.length > 0
          ? oecd.reduce((s, c) => s + (c.groups?.[g] ?? 0), 0) / oecd.length
          : 0;
      return {
        group: g,
        [country.country]: country.groups?.[g] ?? 0,
        "OECD avg": Math.round(avg * 10) / 10,
      };
    });
  }, [country, countries, groups]);

  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-3">
        <h3 className="text-sm font-bold text-navy-dark">
          Sector-coverage profile
        </h3>
        <p className="text-xs text-navy-mid/70">
          {country.country} vs OECD average · covered sub-sectors per group
        </p>
      </div>
      <div className="h-[340px] w-full">
        {mounted ? (
          <ResponsiveRadar
            data={data}
            theme={nivoTheme}
            keys={[country.country, "OECD avg"]}
            indexBy="group"
            margin={{ top: 40, right: 60, bottom: 30, left: 60 }}
            gridLabelOffset={14}
            dotSize={6}
            colors={["#19376d", "#9fb3d6"]}
            fillOpacity={0.2}
            borderWidth={2}
            gridShape="circular"
            legends={[
              {
                anchor: "top-left",
                direction: "column",
                translateX: -50,
                translateY: -30,
                itemWidth: 90,
                itemHeight: 18,
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
