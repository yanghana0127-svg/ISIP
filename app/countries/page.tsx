import { getISMCountries, getISMMeta, getISMYearly } from "@/lib/data";
import { getCountryList } from "@/lib/country";
import { CountryGrid } from "@/components/country-grid";
import { WorldMap } from "@/components/charts/world-map";
import { CoverageHeatmap } from "@/components/charts/coverage-heatmap";
import { MechanismFeatures } from "@/components/charts/mechanism-features";
import { StrictnessRank } from "@/components/charts/strictness-rank";
import Link from "next/link";
import { Globe2, BarChart3, Grid3x3, GitCompare } from "lucide-react";

export const metadata = {
  title: "Country Atlas · ISIP",
};

export default async function CountriesPage() {
  const [list, ismCountries, meta, ismYearly] = await Promise.all([
    getCountryList(),
    getISMCountries(),
    getISMMeta(),
    getISMYearly(),
  ]);

  return (
    <div className="space-y-12">
      {/* hero */}
      <section className="glass-dark relative overflow-hidden rounded-3xl px-8 py-12 text-white shadow-[0_44px_90px_-48px_rgba(11,36,71,0.5)]">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gradient-to-br from-[#5ad7e8] to-[#19376d] opacity-40 blur-3xl" />
        <div className="relative max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-md">
            <Globe2 className="h-3.5 w-3.5" /> Country Atlas
          </div>
          <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
            <span className="text-metallic-light">
              How every country screens foreign investment
            </span>
          </h1>
          <p className="max-w-2xl text-sm text-white/75">
            {list.length} jurisdictions · {meta.countryCount} with full PRISM
            ISM mechanism data. Compare strictness, sector coverage and the way
            regimes have evolved — then open any country for the full profile.
          </p>
          <Link
            href="/countries/compare"
            className="glass-button inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-navy-dark"
          >
            <GitCompare className="h-4 w-4" /> Compare countries
          </Link>
        </div>
      </section>

      {/* animated world screening map */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Globe2 className="h-4 w-4 text-navy-soft" />
          <h2 className="text-xl font-bold text-gradient-navy">
            The screening map
          </h2>
          <span className="text-xs text-navy-mid/60">
            Drag the year, or hit play, to watch FDI screening spread worldwide
          </span>
        </div>
        <WorldMap
          countries={ismCountries}
          yearly={ismYearly}
          yearlyRange={meta.yearlyRange}
        />
      </section>

      {/* site-wide insights */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Grid3x3 className="h-4 w-4 text-navy-soft" />
          <h2 className="text-xl font-bold text-gradient-navy">
            Cross-country insights
          </h2>
        </div>
        <CoverageHeatmap countries={ismCountries} groups={meta.sectorGroups} />
        <div className="grid gap-4 lg:grid-cols-2">
          <StrictnessRank countries={ismCountries} topN={15} />
          <MechanismFeatures
            countries={ismCountries}
            featureLabels={meta.featureLabels}
          />
        </div>
      </section>

      {/* country grid */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-navy-soft" />
          <h2 className="text-xl font-bold text-gradient-navy">
            Browse all countries
          </h2>
          <span className="text-xs text-navy-mid/60">
            Click any country for its full visual profile
          </span>
        </div>
        <CountryGrid list={list} />
      </section>
    </div>
  );
}
