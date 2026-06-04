import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getIndustry,
  getPoliciesByIndustry,
  getIndustries,
  getISMCountries,
  getISMMeta,
} from "@/lib/data";
import { PolicyCard } from "@/components/policy-card";
import { ContextChat } from "@/components/context-chat";
import { ArrowLeft, Sparkles, BarChart3 } from "lucide-react";
import {
  CountryPolicyCountBar,
  PolicyTimelineArea,
  CountryDecadeStack,
} from "@/components/charts/industry-charts";
import { SubsectorScreening } from "@/components/charts/subsector-screening";

export async function generateStaticParams() {
  const all = await getIndustries();
  return all.map((i) => ({ slug: i.slug }));
}

export default async function IndustryPage({
  params,
}: {
  params: { slug: string };
}) {
  const ind = await getIndustry(params.slug);
  if (!ind) notFound();

  const [policies, ismCountries, ismMeta] = await Promise.all([
    getPoliciesByIndustry(params.slug),
    getISMCountries(),
    getISMMeta(),
  ]);

  // Within this sector, how many ISM countries screen each sub-sector.
  const members = ismMeta.sectorMembers[ind.name_en] ?? [];
  const subsectorData = members
    .map((label) => ({
      label,
      count: ismCountries.filter((c) => c.sectors.includes(label)).length,
    }))
    .filter((d) => d.count > 0)
    .sort((a, b) => b.count - a.count);

  const byCountry: Record<string, typeof policies> = {};
  for (const p of policies) {
    (byCountry[p.country] ??= []).push(p);
  }
  const countries = Object.keys(byCountry).sort();

  const yearsKnown = policies.map((p) => p.year).filter((y): y is number => !!y);
  const yearRange =
    yearsKnown.length > 0
      ? `${Math.min(...yearsKnown)} — ${Math.max(...yearsKnown)}`
      : "—";

  return (
    <div className="space-y-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-navy-mid hover:text-navy-dark"
      >
        <ArrowLeft className="h-4 w-4" /> Back to home
      </Link>

      {/* header */}
      <header className="glass-dark relative overflow-hidden rounded-3xl p-8 text-white">
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full opacity-50 blur-3xl"
          style={{ background: ind.color }}
        />
        <div
          className="pointer-events-none absolute -left-16 bottom-0 h-64 w-64 rounded-full opacity-30 blur-3xl"
          style={{ background: "#7c5cff" }}
        />
        <div className="relative">
          <div className="text-xs font-semibold uppercase tracking-wider text-white/60">
            Industry sector
          </div>
          <h1 className="mt-1 text-3xl font-bold md:text-4xl">{ind.name_en}</h1>
          <p className="mt-1 text-sm text-white/70">{ind.name_zh}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Pill>{ind.policy_count} policies</Pill>
            <Pill>{ind.country_count} countries</Pill>
            <Pill>Years {yearRange}</Pill>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {ind.keywords.slice(0, 12).map((k) => (
              <span
                key={k}
                className="rounded-md border border-white/15 bg-white/10 px-2 py-0.5 text-xs text-white/85 backdrop-blur-sm"
              >
                {k}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* Visualizations */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-navy-soft" />
          <h2 className="text-xl font-bold text-gradient-navy">Data insights</h2>
          <span className="text-xs text-navy-mid/60">
            Compare how countries regulate this sector at a glance
          </span>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <CountryPolicyCountBar policies={policies} topN={12} />
          <PolicyTimelineArea policies={policies} />
          <CountryDecadeStack policies={policies} topN={8} />
          <SubsectorScreening
            data={subsectorData}
            total={ismCountries.length}
          />
        </div>
      </section>

      {/* Agent CTA */}
      <section className="glass-soft flex flex-col items-start gap-4 rounded-2xl p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-navy-dark">
            <Sparkles className="h-4 w-4 text-navy-soft" />
            <span className="text-sm font-semibold">
              Ask the AI Advisor about this sector
            </span>
          </div>
          <p className="mt-1 text-sm text-navy-mid">
            Try: “How do US and EU screening thresholds differ for{" "}
            {ind.name_en}?”
          </p>
        </div>
        <ContextChat industry={ind.slug} name={ind.name_en} />
      </section>

      {/* policies by country */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-gradient-navy">
          Related policies, grouped by country
        </h2>
        {countries.length === 0 && (
          <div className="glass-soft rounded-2xl p-12 text-center text-sm text-navy-mid/70">
            No matching policies
          </div>
        )}
        {countries.map((c) => (
          <div key={c}>
            <div className="mb-2 flex items-baseline gap-2">
              <h3 className="text-base font-semibold text-navy-mid">{c}</h3>
              <span className="text-xs text-navy-mid/60">
                {byCountry[c].length} policies
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {byCountry[c].map((p) => (
                <PolicyCard key={p.id} policy={p} />
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-white/20 bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
      {children}
    </span>
  );
}
