import Link from "next/link";
import { getISMCountries, getISMMeta } from "@/lib/data";
import { CompareTool } from "@/components/compare-tool";
import { ArrowLeft, GitCompare } from "lucide-react";

export const metadata = {
  title: "Compare countries · ISIP",
};

export default async function ComparePage() {
  const [countries, meta] = await Promise.all([
    getISMCountries(),
    getISMMeta(),
  ]);

  return (
    <div className="space-y-6">
      <Link
        href="/countries"
        className="inline-flex items-center gap-1 text-sm text-navy-mid hover:text-navy-dark"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Country Atlas
      </Link>

      <section className="glass-dark relative overflow-hidden rounded-3xl px-8 py-12 text-white">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gradient-to-br from-[#5ad7e8] to-[#19376d] opacity-40 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-gradient-to-br from-[#7c5cff] to-[#576cbc] opacity-30 blur-3xl" />
        <div className="relative max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-md">
            <GitCompare className="h-3.5 w-3.5" /> Compare
          </div>
          <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
            <span className="text-metallic-light">
              Compare screening regimes side by side
            </span>
          </h1>
          <p className="max-w-2xl text-sm text-white/75">
            Pick up to three countries to compare strictness, thresholds,
            notification regimes, review windows, sector coverage and mechanism
            features — all from the PRISM ISM dataset.
          </p>
        </div>
      </section>

      <CompareTool
        countries={countries}
        featureLabels={meta.featureLabels}
        sectorGroups={meta.sectorGroups}
      />
    </div>
  );
}
