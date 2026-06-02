import Link from "next/link";
import { notFound } from "next/navigation";
import { getCountryProfile, getCountrySlugs } from "@/lib/country";
import { getISMCountries, getISMMeta } from "@/lib/data";
import { PolicyCard } from "@/components/policy-card";
import { IndustryDonut, StrictnessTrend } from "@/components/charts/country-mini";
import { CountryRadar } from "@/components/charts/country-radar";
import { PolicyTimelineArea } from "@/components/charts/industry-charts";
import { ContextChat } from "@/components/context-chat";
import {
  Shield,
  Gauge,
  Building2,
  CalendarClock,
  ArrowLeft,
} from "lucide-react";

export async function generateStaticParams() {
  const slugs = await getCountrySlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function CountryPage({
  params,
}: {
  params: { slug: string };
}) {
  const [profile, ismCountries, meta] = await Promise.all([
    getCountryProfile(params.slug),
    getISMCountries(),
    getISMMeta(),
  ]);
  if (!profile) notFound();
  const { ism } = profile;

  const facts: { label: string; value: string }[] = [];
  if (ism) {
    if (ism.established) facts.push({ label: "Mechanism since", value: `${ism.established}` });
    facts.push({ label: "Active mechanisms", value: `${ism.mechanisms}` });
    if (ism.coverage) facts.push({ label: "Coverage", value: ism.coverage });
    if (ism.notification) facts.push({ label: "Notification", value: ism.notification });
    if (ism.threshold) facts.push({ label: "Threshold", value: ism.threshold });
    if (ism.timeframe) facts.push({ label: "Review window", value: ism.timeframe });
    facts.push({ label: "Sectors covered", value: `${ism.totalSectors}` });
  }

  const changes = profile.yearly
    .filter((y) => y.totalNew > 0)
    .sort((a, b) => b.year - a.year)
    .slice(0, 8);

  return (
    <div className="space-y-8">
      <Link
        href="/countries"
        className="inline-flex items-center gap-1 text-sm text-navy-mid hover:text-navy-dark"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Country Atlas
      </Link>

      {/* header */}
      <header className="glass-dark relative overflow-hidden rounded-3xl p-8 text-white">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-gradient-to-br from-[#5ad7e8] to-[#19376d] opacity-40 blur-3xl" />
        <div className="relative flex flex-wrap items-start justify-between gap-6">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-white/60">
              Country profile
            </div>
            <h1 className="mt-1 text-3xl font-bold md:text-4xl">{profile.name}</h1>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {ism?.oecd === 1 && <Pill>OECD</Pill>}
              {ism?.eu === 1 && <Pill>EU/EEA</Pill>}
              {ism?.fiveEyes === 1 && <Pill>Five Eyes</Pill>}
              <Pill>{profile.policyCount} policies</Pill>
              {ism?.leadAuthority && <Pill>{ism.leadAuthority}</Pill>}
            </div>
          </div>
          {ism && (
            <div className="rounded-2xl border border-white/20 bg-white/10 px-5 py-4 text-center backdrop-blur-md">
              <div className="flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-white/65">
                <Gauge className="h-3.5 w-3.5" /> Strictness Index
              </div>
              <div className="mt-1 font-mono text-4xl font-bold text-white">
                {ism.strictness.toFixed(0)}
              </div>
              <div className="text-xs text-white/65">
                #{ism.strictnessRank} of {meta.countryCount} · /100
              </div>
            </div>
          )}
        </div>
      </header>

      {/* mechanism facts */}
      {facts.length > 0 && (
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {facts.map((f) => (
            <div key={f.label} className="glass-soft rounded-2xl p-4">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-navy-mid/55">
                {f.label}
              </div>
              <div className="mt-1 text-sm font-bold text-navy-dark">
                {f.value}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* visualizations */}
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="glass rounded-2xl p-5">
          <div className="mb-2">
            <h3 className="text-sm font-bold text-navy-dark">
              Policy mix by sector
            </h3>
            <p className="text-xs text-navy-mid/70">
              How this country&apos;s {profile.policyCount} policies split across
              the 7 sectors
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-56 flex-1">
              <IndustryDonut mix={profile.industryMix} />
            </div>
            <ul className="hidden shrink-0 space-y-1.5 text-xs sm:block">
              {profile.industryMix.map((m) => (
                <li key={m.slug} className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-sm"
                    style={{ background: m.color }}
                  />
                  <span className="text-navy-dark">{m.name}</span>
                  <span className="text-navy-mid/55">{m.count}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <PolicyTimelineArea policies={profile.policies} />

        {ism && profile.panel.length >= 2 && (
          <div className="glass rounded-2xl p-5">
            <div className="mb-2">
              <h3 className="text-sm font-bold text-navy-dark">
                Strictness over time
              </h3>
              <p className="text-xs text-navy-mid/70">
                How the screening regime tightened, {profile.panel[0].year}–
                {profile.panel[profile.panel.length - 1].year}
              </p>
            </div>
            <div className="h-56">
              <StrictnessTrend panel={profile.panel} />
            </div>
          </div>
        )}

        {ism && (
          <CountryRadar
            country={ism}
            countries={ismCountries}
            groups={meta.sectorGroups}
          />
        )}
      </section>

      {/* change log */}
      {changes.length > 0 && (
        <section className="glass rounded-2xl p-5">
          <div className="mb-3 flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-navy-soft" />
            <h3 className="text-sm font-bold text-navy-dark">
              Recent legislative changes
            </h3>
          </div>
          <ul className="space-y-2">
            {changes.map((c) => (
              <li
                key={c.year}
                className="flex items-center gap-3 border-l-2 border-navy-soft/40 pl-3 text-sm"
              >
                <span className="font-mono font-bold text-navy-dark">
                  {c.year}
                </span>
                <span className="text-navy-mid/80">
                  {[
                    c.newLaw && `${c.newLaw} new law${c.newLaw > 1 ? "s" : ""}`,
                    c.newAmendment && `${c.newAmendment} amendment${c.newAmendment > 1 ? "s" : ""}`,
                    c.newEO && `${c.newEO} executive order${c.newEO > 1 ? "s" : ""}`,
                    c.newReg && `${c.newReg} regulation${c.newReg > 1 ? "s" : ""}`,
                  ]
                    .filter(Boolean)
                    .join(" · ") || `${c.totalNew} new`}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* chat CTA */}
      <section className="glass-soft flex flex-col items-start gap-4 rounded-2xl p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-navy-dark">
            <Shield className="h-4 w-4 text-navy-soft" />
            <span className="text-sm font-semibold">
              Ask the AI Advisor about {profile.name}
            </span>
          </div>
          <p className="mt-1 text-sm text-navy-mid">
            Grounded in {profile.name}&apos;s statutes, ISM data and live web.
          </p>
        </div>
        <ContextChat country={profile.slug} name={profile.name} />
      </section>

      {/* policies */}
      {profile.policies.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-navy-soft" />
            <h2 className="text-2xl font-bold text-gradient-navy">
              {profile.name}&apos;s screening laws
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {profile.policies.map((p) => (
              <PolicyCard key={p.id} policy={p} />
            ))}
          </div>
        </section>
      )}
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
