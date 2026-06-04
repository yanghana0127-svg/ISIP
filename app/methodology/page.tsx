import { getISMMeta, getStats } from "@/lib/data";
import { BookOpen, Database, Scale, ShieldAlert } from "lucide-react";

export const metadata = { title: "Methodology & sources · ISIP" };

const WEIGHT_LABELS: Record<string, string> = {
  notification: "Mandatory notification",
  preapproval: "Pre-approval required",
  callIn: "Formal call-in power",
  nsTest: "National-security / public-order test",
  netBenefit: "Net-benefit test",
  competition: "Competition test",
  reviewIncrease: "Reviews ownership increases",
  greenfield: "Covers greenfield",
  realEstate: "Covers real estate",
  mitigation: "Mitigation agreements",
  fines: "Fines for non-compliance",
  enhancedGovControl: "Enhanced gov't-control review",
  coverageBreadth: "Sector-coverage breadth",
};

export default async function MethodologyPage() {
  const [meta, stats] = await Promise.all([getISMMeta(), getStats()]);
  const weights = Object.entries(meta.strictness.weights).sort(
    (a, b) => b[1] - a[1],
  );

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <section className="glass-dark relative overflow-hidden rounded-3xl px-8 py-12 text-white">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gradient-to-br from-[#5ad7e8] to-[#19376d] opacity-40 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-gradient-to-br from-[#7c5cff] to-[#576cbc] opacity-30 blur-3xl" />
        <div className="relative max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-md">
            <BookOpen className="h-3.5 w-3.5" /> Methodology &amp; sources
          </div>
          <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
            <span className="text-metallic-light">How this platform is built</span>
          </h1>
          <p className="max-w-2xl text-sm text-white/75">
            Transparency on the data, the Screening Strictness Index, and the
            limits of what you see here.
          </p>
        </div>
      </section>

      {/* data sources */}
      <Section icon={<Database className="h-4 w-4" />} title="Data sources">
        <ul className="ml-4 list-disc space-y-2 text-sm text-navy-mid/85">
          <li>
            <strong className="text-navy-dark">
              {stats.policy_count} screening statutes
            </strong>{" "}
            across {stats.country_count} countries — the primary legal texts,
            chunked and vector-indexed for the AI Advisor&apos;s Policy mode.
          </li>
          <li>
            <strong className="text-navy-dark">PRISM ISM dataset</strong> —
            structured Investment Screening Mechanism data (country × year
            panel, {meta.yearRange[0]}–{meta.yearRange[1]}; mechanism
            attributes, thresholds, sector-coverage flags and change history).
            Source: the PRISM project (Bauerle Danzman &amp; Meunier).
          </li>
          <li>
            <strong className="text-navy-dark">Live web search</strong> (Tavily)
            powers the &quot;What&apos;s new&quot; feed and the AI Advisor&apos;s
            Web / Deep Research modes.
          </li>
        </ul>
      </Section>

      {/* strictness index */}
      <Section icon={<Scale className="h-4 w-4" />} title="Screening Strictness Index">
        <p className="text-sm text-navy-mid/85">
          A 0–100 composite that summarises how demanding a country&apos;s
          screening regime is. Each ISM mechanism feature contributes a weighted
          amount; the weighted sum is normalised by the maximum possible weight
          ({meta.strictness.max}) and scaled to 100. Higher = stricter / broader.
        </p>
        <div className="mt-3 overflow-hidden rounded-xl border border-navy-mid/10">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-navy-mid/5 text-left text-xs uppercase tracking-wider text-navy-mid/70">
                <th className="px-3 py-2 font-semibold">Feature</th>
                <th className="px-3 py-2 text-right font-semibold">Weight</th>
              </tr>
            </thead>
            <tbody>
              {weights.map(([k, w]) => (
                <tr key={k} className="border-t border-navy-mid/8">
                  <td className="px-3 py-1.5 text-navy-mid/85">
                    {WEIGHT_LABELS[k] ?? k}
                  </td>
                  <td className="px-3 py-1.5 text-right font-mono font-semibold text-navy-dark">
                    ×{w}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-navy-mid/60">
          The index is a descriptive summary of coded features — not an official
          ranking, and it does not capture enforcement intensity or
          case-by-case discretion.
        </p>
      </Section>

      {/* sector taxonomy */}
      <Section icon={<BookOpen className="h-4 w-4" />} title="Sector taxonomy">
        <p className="text-sm text-navy-mid/85">
          The whole platform uses one set of {meta.sectorGroups.length} sectors.
          Both the statute tags and the granular ISM sector-coverage flags are
          mapped into these same buckets, so policy and ISM data line up:
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {meta.sectorGroups.map((g) => (
            <span
              key={g}
              className="rounded-full border border-navy-mid/15 bg-white/50 px-3 py-1 text-xs font-semibold text-navy-mid"
            >
              {g}
            </span>
          ))}
        </div>
      </Section>

      {/* disclaimer */}
      <Section
        icon={<ShieldAlert className="h-4 w-4" />}
        title="Disclaimer & citations"
      >
        <p className="text-sm text-navy-mid/85">
          ISIP is an informational research tool.{" "}
          <strong className="text-navy-dark">
            It is not legal advice
          </strong>{" "}
          and may contain errors, omissions or out-of-date information. Always
          verify against the primary statute and consult qualified counsel
          before acting on any screening question.
        </p>
        <p className="mt-2 text-sm text-navy-mid/85">
          Structured screening data: PRISM Investment Screening Mechanisms
          dataset (Sarah Bauerle Danzman &amp; Sophie Meunier). Statute texts
          remain the property of their respective governments. AI answers are
          generated and must be checked against the cited sources.
        </p>
      </Section>
    </div>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="glass rounded-2xl p-6">
      <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-navy-dark">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-navy-mid/10 text-navy-mid">
          {icon}
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}
