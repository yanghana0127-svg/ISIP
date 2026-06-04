import Link from "next/link";
import { getStats, getISMMeta } from "@/lib/data";
import {
  Compass,
  Home,
  Globe2,
  GitCompare,
  FileSearch,
  Newspaper,
  MessageSquare,
  BookOpen,
  Layers,
  ArrowRight,
  Database,
} from "lucide-react";

export const metadata = { title: "Guide · ISIP" };

export default async function GuidePage() {
  const [stats, meta] = await Promise.all([getStats(), getISMMeta()]);

  const sections = [
    {
      icon: <Home className="h-5 w-5" />,
      tag: "Home",
      href: "/",
      title: "Start here — browse by sector",
      what: "The landing page. Opens with the 7 industry sectors as cards, then a global overview of which countries legislate most and which sectors draw the most attention.",
      points: [
        `Click any of the ${stats.industry_count} sector cards to see how the world regulates that industry`,
        "A global timeline shows the worldwide “tightening wave” of new screening rules over time",
        "Jump-off points to search policies or ask the AI Advisor",
      ],
    },
    {
      icon: <Globe2 className="h-5 w-5" />,
      tag: "Countries",
      href: "/countries",
      title: "Country Atlas — the geographic view",
      what: `How every country screens foreign investment. ${stats.country_count} jurisdictions, ${meta.countryCount} with full PRISM ISM mechanism data.`,
      points: [
        "Animated world map — drag the year or hit play to watch screening spread; toggle Mechanisms (navy) vs Strictness (teal)",
        "Coverage heatmap: which of the 7 sectors each country screens, and how deeply",
        "Strictness Index ranking + a “mechanism features adoption” bar (how common call-in power, security tests, etc. are)",
        "Searchable country grid → open any country for its full profile",
      ],
    },
    {
      icon: <GitCompare className="h-5 w-5" />,
      tag: "Compare",
      href: "/countries/compare",
      title: "Compare regimes side by side",
      what: "Pick up to three countries and compare them directly — the core “how do US vs Germany differ for my deal?” question.",
      points: [
        "Strictness (with a visual bar), ownership threshold (normalized to %), notification regime, review window",
        "Sector-by-sector coverage and every mechanism feature, shown as Yes/No pills",
        "Bloc membership (OECD / EU / Five Eyes)",
      ],
    },
    {
      icon: <FileSearch className="h-5 w-5" />,
      tag: "Policies",
      href: "/policies",
      title: "The statute library",
      what: `All ${stats.policy_count} foreign-investment screening laws, searchable and filterable by country and sector.`,
      points: [
        "Full-text search across the corpus",
        "Open any statute to read the source text",
        "These same statutes power the AI Advisor’s Policy mode",
      ],
    },
    {
      icon: <Layers className="h-5 w-5" />,
      tag: "Sectors",
      href: "/industry/semiconductor-computing",
      title: "Sector deep-dives",
      what: "Each of the 7 sectors has its own page: who regulates it, when laws were enacted, and what inside the sector actually gets screened.",
      points: [
        "Top countries by policy count + a timeline and decade breakdown",
        "“Most-screened sub-sectors” — e.g. for tech: AI/ML vs microprocessors vs quantum",
        "Ask the AI Advisor in-context, scoped to that sector",
      ],
    },
    {
      icon: <Newspaper className="h-5 w-5" />,
      tag: "What's new",
      href: "/news",
      title: "Live developments",
      what: "A live feed of recent FDI-screening news, reviews and notable cases, refreshed automatically from the web.",
      points: [
        "Latest laws, decisions and blocked deals",
        "Always links back to the original source",
      ],
    },
    {
      icon: <MessageSquare className="h-5 w-5" />,
      tag: "AI Advisor",
      href: "/chat",
      title: "Ask in plain language, get cited answers",
      what: "A retrieval-grounded assistant with three modes. Every answer carries inline citations, and it replies in the language you ask in.",
      points: [
        "Policy — vector search across the statutes for exact wording",
        "Web — live search for breaking news and recent cases",
        "Deep Research — fuses statutes + structured ISM data + live web into a structured opinion (landscape, risks, recommendations)",
        "Also available as a floating, draggable window on any country or sector page",
      ],
    },
    {
      icon: <BookOpen className="h-5 w-5" />,
      tag: "Methodology",
      href: "/methodology",
      title: "How the numbers are built",
      what: "Full transparency: the Strictness Index formula and weights, the data sources, the sector taxonomy, and the disclaimer.",
      points: [
        "Read this to understand exactly what the Strictness Index measures",
        "Data provenance: the statute corpus + the PRISM ISM dataset",
      ],
    },
  ];

  return (
    <div className="space-y-8">
      {/* hero */}
      <section className="glass-dark relative overflow-hidden rounded-3xl px-8 py-12 text-white shadow-[0_44px_90px_-48px_rgba(11,36,71,0.5)]">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gradient-to-br from-[#5ad7e8] to-[#19376d] opacity-40 blur-3xl" />
        <div className="relative max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-md">
            <Compass className="h-3.5 w-3.5" /> Guided tour
          </div>
          <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
            <span className="text-metallic-light">
              What is ISIP, and how do I use it?
            </span>
          </h1>
          <p className="max-w-2xl text-sm text-white/75">
            ISIP turns the world&apos;s foreign-investment screening rules into
            one searchable, comparable, AI-assisted platform. It fuses three
            sources — the statutes themselves, the structured PRISM ISM dataset,
            and live web search. Here&apos;s every part of the site.
          </p>
          <div className="flex flex-wrap gap-2 pt-1 text-xs">
            <Stat label="statutes" value={stats.policy_count} />
            <Stat label="countries" value={stats.country_count} />
            <Stat label="sectors" value={stats.industry_count} />
            <Stat label="ISM countries" value={meta.countryCount} />
          </div>
        </div>
      </section>

      {/* three-source explainer */}
      <section className="glass rounded-2xl p-6">
        <div className="mb-3 flex items-center gap-2 text-navy-dark">
          <Database className="h-4 w-4 text-navy-soft" />
          <h2 className="text-lg font-bold">The idea: three sources, one view</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Source
            n="1"
            title="Policy text"
            desc={`${stats.policy_count} screening statutes — the authoritative legal wording.`}
          />
          <Source
            n="2"
            title="Structured ISM data"
            desc="The PRISM dataset — thresholds, mechanism features, sector coverage and change history per country."
          />
          <Source
            n="3"
            title="Live web"
            desc="Real-time search for the latest decisions, cases and news."
          />
        </div>
      </section>

      {/* sections */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-navy-dark">Every part of the site</h2>
        <div className="space-y-3">
          {sections.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="glass-soft group flex flex-col gap-3 rounded-2xl p-5 transition hover:-translate-y-0.5 sm:flex-row sm:items-start sm:gap-5"
            >
              <div className="flex items-center gap-3 sm:w-44 sm:shrink-0">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-navy-mid to-navy-soft text-white shadow-sm">
                  {s.icon}
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-navy-soft">
                  {s.tag}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5 text-base font-bold text-navy-dark group-hover:text-navy-soft">
                  {s.title}
                  <ArrowRight className="h-3.5 w-3.5 opacity-0 transition group-hover:opacity-100" />
                </div>
                <p className="mt-1 text-sm text-navy-mid/85">{s.what}</p>
                <ul className="mt-2 space-y-1">
                  {s.points.map((p, i) => (
                    <li
                      key={i}
                      className="flex gap-2 text-[13px] leading-snug text-navy-mid/80"
                    >
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-navy-soft" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="glass-soft rounded-2xl p-6 text-center">
        <h2 className="text-lg font-bold text-navy-dark">
          New here? Try this 30-second path
        </h2>
        <p className="mx-auto mt-1 max-w-xl text-sm text-navy-mid/80">
          Open a <Link href="/" className="font-semibold text-navy-soft hover:underline">sector</Link>{" "}
          → jump to the{" "}
          <Link href="/countries" className="font-semibold text-navy-soft hover:underline">Country Atlas</Link>{" "}
          and play the map →{" "}
          <Link href="/countries/compare" className="font-semibold text-navy-soft hover:underline">compare</Link>{" "}
          two countries → ask the{" "}
          <Link href="/chat" className="font-semibold text-navy-soft hover:underline">AI Advisor</Link>{" "}
          a question and watch it cite its sources.
        </p>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-white/20 bg-white/10 px-2.5 py-1 backdrop-blur-md">
      <span className="font-mono text-sm font-bold text-white">{value}</span>
      <span className="ml-1 text-white/70">{label}</span>
    </div>
  );
}

function Source({
  n,
  title,
  desc,
}: {
  n: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-xl border border-navy-mid/10 bg-white/50 p-4">
      <div className="flex items-center gap-2">
        <span className="grid h-6 w-6 place-items-center rounded-full bg-navy-soft/20 text-xs font-bold text-navy-mid">
          {n}
        </span>
        <span className="text-sm font-bold text-navy-dark">{title}</span>
      </div>
      <p className="mt-1.5 text-xs leading-relaxed text-navy-mid/80">{desc}</p>
    </div>
  );
}
