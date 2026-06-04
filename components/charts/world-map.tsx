"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ResponsiveChoropleth } from "@nivo/geo";
import { Play, Pause } from "lucide-react";
import type { ISMCountry, ISMYearly } from "@/lib/types";
import {
  useMounted,
  nivoTheme,
  NAVY_RAMP,
  TEAL_RAMP,
  rampGradient,
  ChartSkeleton,
} from "./nivo-shared";

type Metric = "cumulative" | "strictness";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GeoFeatures = { features: any[] };

export function WorldMap({
  countries,
  yearly,
  yearlyRange,
}: {
  countries: ISMCountry[];
  yearly: ISMYearly[];
  yearlyRange: [number, number];
}) {
  const mounted = useMounted();
  const [features, setFeatures] = useState<GeoFeatures["features"] | null>(null);
  const [metric, setMetric] = useState<Metric>("cumulative");
  const [year, setYear] = useState(yearlyRange[1]);
  const [playing, setPlaying] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/world_countries.geo.json")
      .then((r) => r.json())
      .then((g: GeoFeatures) => alive && setFeatures(g.features))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!playing) return;
    timer.current = setInterval(() => {
      setYear((y) => {
        if (y >= yearlyRange[1]) {
          setPlaying(false);
          return y;
        }
        return y + 1;
      });
    }, 600);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [playing, yearlyRange]);

  const slugToA3 = useMemo(() => {
    const m = new Map<string, string>();
    for (const c of countries) if (c.isoA3) m.set(c.slug, c.isoA3);
    return m;
  }, [countries]);

  const data = useMemo(() => {
    if (metric === "strictness") {
      return countries
        .filter((c) => c.isoA3)
        .map((c) => ({ id: c.isoA3 as string, value: c.strictness }));
    }
    const cum = new Map<string, number>();
    for (const y of yearly) {
      if (y.year <= year) cum.set(y.slug, (cum.get(y.slug) ?? 0) + y.totalNew);
    }
    const out: { id: string; value: number }[] = [];
    Array.from(cum.entries()).forEach(([slug, value]) => {
      const a3 = slugToA3.get(slug);
      if (a3 && value > 0) out.push({ id: a3, value });
    });
    return out;
  }, [metric, year, yearly, countries, slugToA3]);

  const domainMax = useMemo(() => {
    if (metric === "strictness") return 100;
    const cum = new Map<string, number>();
    for (const y of yearly)
      cum.set(y.slug, (cum.get(y.slug) ?? 0) + y.totalNew);
    return Math.max(4, ...Array.from(cum.values()));
  }, [metric, yearly]);

  const ramp = metric === "strictness" ? TEAL_RAMP : NAVY_RAMP;

  return (
    <div className="glass-dark relative overflow-hidden rounded-3xl p-5 text-white">
      {/* hero-style gradient wash */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-gradient-to-br from-[#7c5cff] to-[#576cbc] opacity-40 blur-3xl" />
      <div className="pointer-events-none absolute -right-28 bottom-0 h-96 w-96 rounded-full bg-gradient-to-br from-[#5ad7e8] to-[#19376d] opacity-35 blur-3xl" />
      <div className="pointer-events-none absolute left-1/3 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-gradient-to-br from-[#576cbc] to-[#19376d] opacity-25 blur-3xl" />
      <div className="relative mb-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-white">
            Where the world screens foreign investment
          </h3>
          <p className="text-xs text-white/65">
            {metric === "strictness"
              ? "Screening Strictness Index by country (latest available)"
              : `Cumulative new screening mechanisms through ${year}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-full border border-white/20 bg-white/10 p-0.5 text-xs">
            <button
              onClick={() => setMetric("cumulative")}
              className={`rounded-full px-3 py-1 font-semibold transition ${
                metric === "cumulative"
                  ? "bg-white text-navy-dark"
                  : "text-white/70 hover:text-white"
              }`}
            >
              Mechanisms
            </button>
            <button
              onClick={() => setMetric("strictness")}
              className={`rounded-full px-3 py-1 font-semibold transition ${
                metric === "strictness"
                  ? "bg-white text-navy-dark"
                  : "text-white/70 hover:text-white"
              }`}
            >
              Strictness
            </button>
          </div>
        </div>
      </div>

      <div className="relative h-[320px] w-full sm:h-[420px]">
        {mounted && features ? (
          <ResponsiveChoropleth
            data={data}
            features={features}
            theme={nivoTheme}
            colors={ramp}
            domain={[0, domainMax]}
            unknownColor="rgba(255,255,255,0.08)"
            valueFormat=".0f"
            projectionType="mercator"
            projectionScale={148}
            projectionTranslation={[0.5, 0.72]}
            borderWidth={0.4}
            borderColor="rgba(255,255,255,0.25)"
            enableGraticule={false}
            tooltip={({ feature }) => {
              const f = feature as unknown as {
                label?: string;
                value?: number;
                data?: { value?: number };
              };
              const v = f.value ?? f.data?.value;
              if (v == null) return null;
              return (
                <div className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-navy-dark shadow-lg">
                  {f.label}: {metric === "strictness" ? v.toFixed(0) : v}
                  {metric === "strictness" ? " / 100" : " mechanisms"}
                </div>
              );
            }}
          />
        ) : (
          <ChartSkeleton />
        )}
      </div>

      {/* continuous color legend */}
      <div className="relative mt-3 flex items-center gap-3">
        <span className="text-[11px] text-white/60">
          {metric === "strictness" ? "Strictness 0" : "0"}
        </span>
        <div
          className="h-2 flex-1 rounded-full"
          style={{ background: rampGradient(ramp) }}
        />
        <span className="text-[11px] text-white/60">
          {metric === "strictness"
            ? "100"
            : `${domainMax} mechanisms`}
        </span>
      </div>

      {metric === "cumulative" && (
        <div className="relative mt-2 flex items-center gap-3">
          <button
            onClick={() => {
              if (year >= yearlyRange[1]) setYear(yearlyRange[0]);
              setPlaying((p) => !p);
            }}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/90 text-navy-dark transition hover:bg-white"
            aria-label={playing ? "Pause" : "Play"}
          >
            {playing ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </button>
          <input
            type="range"
            min={yearlyRange[0]}
            max={yearlyRange[1]}
            value={year}
            onChange={(e) => {
              setPlaying(false);
              setYear(Number(e.target.value));
            }}
            className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-white/25 accent-white"
          />
          <span className="w-12 shrink-0 text-right font-mono text-sm font-bold text-white">
            {year}
          </span>
        </div>
      )}
    </div>
  );
}
