import Link from "next/link";
import {
  getIndustries,
  getStats,
  getCountries,
  getISMYearly,
} from "@/lib/data";
import { IndustryCard } from "@/components/industry-card";
import { GlobalOverview } from "@/components/charts/global-overview";
import { GlobalTimeline } from "@/components/charts/global-timeline";
import {
  Search,
  MessageSquare,
  Layers,
  FileSearch,
  GitCompare,
  ClipboardCheck,
  BarChart3,
  Globe2,
} from "lucide-react";

export default async function HomePage() {
  const [industries, stats, countries, ismYearly] = await Promise.all([
    getIndustries(),
    getStats(),
    getCountries(),
    getISMYearly(),
  ]);

  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="glass-dark relative overflow-hidden rounded-3xl px-8 py-14 text-white shadow-[0_44px_90px_-48px_rgba(11,36,71,0.5)]">
        <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-gradient-to-br from-[#7c5cff] to-[#576cbc] opacity-50 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-gradient-to-br from-[#5ad7e8] to-[#19376d] opacity-40 blur-3xl" />

        <div className="relative max-w-3xl space-y-5">
          <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-6xl">
            <span className="text-metallic-light">Every FDI screening rule,</span>
            <span className="block text-metallic-light">one place, one search.</span>
          </h1>
          <p className="max-w-2xl text-sm text-white/75 md:text-base">
            {stats.policy_count} foreign investment screening laws across
            {" "}{stats.country_count} countries, plus the PRISM case dataset.
            Compliance research that used to take weeks now takes minutes.
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            <StatBadge label="policies" value={stats.policy_count} />
            <StatBadge label="countries" value={stats.country_count} />
            <StatBadge label="sectors" value={stats.industry_count} />
            <StatBadge
              label="chars of corpus"
              value={`${(stats.total_chars / 1_000_000).toFixed(1)}M`}
            />
          </div>
          <div className="flex flex-wrap gap-3 pt-4">
            <Link
              href="/policies"
              className="glass-button inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-navy-dark"
            >
              <Search className="h-4 w-4" /> Search policies
            </Link>
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/20"
            >
              <MessageSquare className="h-4 w-4" /> Ask the AI Advisor
            </Link>
          </div>
        </div>
      </section>

      {/* Browse by sector — the primary way in */}
      <section className="space-y-5">
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2 text-navy-mid">
              <Layers className="h-4 w-4" />
              <span className="text-sm font-semibold">Browse by sector</span>
            </div>
            <h2 className="mt-1 text-2xl font-bold text-gradient-navy">
              Pick a sector to see how the world regulates it
            </h2>
          </div>
          <span className="text-xs text-navy-mid/70">
            {industries.length} sectors
          </span>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {industries.map((ind) => (
            <IndustryCard key={ind.slug} ind={ind} />
          ))}
        </div>
      </section>

      {/* Global overview charts */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-navy-soft" />
          <h2 className="text-xl font-bold text-gradient-navy">
            Global overview
          </h2>
          <span className="text-xs text-navy-mid/60">
            Who legislates most, which sectors draw the most attention
          </span>
        </div>
        <GlobalOverview countries={countries} industries={industries} />
      </section>

      {/* Global tightening wave + Country Atlas teaser */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Globe2 className="h-4 w-4 text-navy-soft" />
          <h2 className="text-xl font-bold text-gradient-navy">
            The global tightening wave
          </h2>
          <span className="text-xs text-navy-mid/60">
            New screening mechanisms per year — explore the full map in the
            Country Atlas
          </span>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <GlobalTimeline yearly={ismYearly} />
          <Link
            href="/countries"
            className="glass-soft group flex flex-col justify-center gap-2 rounded-2xl p-6 transition hover:-translate-y-0.5"
          >
            <span className="text-xs font-semibold uppercase tracking-wider text-navy-mid/60">
              Country Atlas
            </span>
            <span className="text-lg font-bold text-navy-dark">
              Explore the animated world screening map →
            </span>
            <span className="text-sm text-navy-mid/80">
              An animated choropleth, Strictness Index, sector-coverage heatmap
              and mechanism timelines — built on the PRISM ISM dataset.
            </span>
          </Link>
        </div>
      </section>

      {/* Three use cases */}
      <section className="glass rounded-3xl p-7">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gradient-navy">
              What the AI Advisor can do for you
            </h2>
            <p className="mt-1 text-sm text-navy-mid/80">
              From finding one clause to drafting a full investment opinion,
              three modes of use
            </p>
          </div>
          <Link
            href="/chat"
            className="hidden text-sm font-semibold text-navy-mid hover:text-navy-dark md:inline-flex md:items-center md:gap-1"
          >
            Start a chat <span aria-hidden>→</span>
          </Link>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <UseCaseCard
            icon={<FileSearch className="h-5 w-5" />}
            tag="Locate a policy"
            title="Ask in one sentence, jump to the source"
            desc='Ask "What is the German notification threshold for semiconductor M&A?" — the AI pulls the exact clause from the relevant statute with a plain-English summary and a link to the source.'
            gradient="from-[#5ad7e8] to-[#576cbc]"
          />
          <UseCaseCard
            icon={<GitCompare className="h-5 w-5" />}
            tag="Compare across countries"
            title="Keep asking, see how regimes differ"
            desc="Follow up with “How do the US and EU rules differ for Chinese buyers?” — the AI compares screening scope, thresholds and special provisions across multiple regimes."
            gradient="from-[#576cbc] to-[#7c5cff]"
          />
          <UseCaseCard
            icon={<ClipboardCheck className="h-5 w-5" />}
            tag="Draft an opinion"
            title="One brief, one complete report"
            desc="Describe your deal (sector, buyer, target country) and the AI returns a full report: risk assessment, similar historical cases, latest policy updates and compliance suggestions."
            gradient="from-[#7c5cff] to-[#19376d]"
          />
        </div>
      </section>
    </div>
  );
}

function StatBadge({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-xs backdrop-blur-md">
      <span className="font-mono text-base font-bold text-white">{value}</span>
      <span className="ml-1.5 text-white/70">{label}</span>
    </div>
  );
}

function UseCaseCard({
  icon,
  tag,
  title,
  desc,
  gradient,
}: {
  icon: React.ReactNode;
  tag: string;
  title: string;
  desc: string;
  gradient: string;
}) {
  return (
    <div className="glass-soft group relative flex h-full flex-col overflow-hidden rounded-2xl p-5 transition hover:-translate-y-0.5">
      <div
        className={`pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br ${gradient} opacity-40 blur-2xl transition group-hover:opacity-70`}
      />
      <div className="relative space-y-3">
        <div className="flex items-center gap-2">
          <span
            className={`grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-sm`}
          >
            {icon}
          </span>
          <span
            className={`bg-gradient-to-r ${gradient} bg-clip-text text-xs font-semibold uppercase tracking-wider text-transparent`}
          >
            {tag}
          </span>
        </div>
        <div className="text-lg font-bold text-navy-dark">{title}</div>
        <div className="text-sm leading-relaxed text-navy-mid/85">{desc}</div>
      </div>
    </div>
  );
}
