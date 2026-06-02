import Link from "next/link";
import type { Industry } from "@/lib/types";
import { ArrowUpRight } from "lucide-react";

const SUBTITLES_EN: Record<string, string> = {
  "defense-security": "Defense · Cyber · Critical Infrastructure",
  "semiconductor-computing": "Chips · AI/ML · Quantum · Computing",
  "energy-resources": "Energy · Nuclear · Minerals",
  "telecom-data": "Telecom · Personal Data · Surveillance",
  "transport-logistics": "Transport · Logistics · Space",
  "bio-medical": "Healthcare · Biotech · Agri-food",
  "finance-property": "Finance · Media · Real Estate",
};

export function IndustryCard({ ind }: { ind: Industry }) {
  return (
    <Link
      href={`/industry/${ind.slug}`}
      className="group glass relative flex h-44 flex-col gap-3 overflow-hidden rounded-2xl p-5 transition hover:-translate-y-1 hover:shadow-xl"
    >
      <div
        className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-40 blur-2xl transition group-hover:opacity-70"
        style={{ background: ind.color }}
      />
      <div className="relative flex items-start justify-between">
        <div className="min-w-0">
          <div className="truncate text-base font-bold leading-tight text-navy-dark">
            {ind.name_en}
          </div>
          <div className="mt-0.5 text-xs text-navy-mid/65">{ind.name_zh}</div>
          <div className="mt-2 text-[11px] leading-snug text-navy-mid/75">
            {SUBTITLES_EN[ind.slug]}
          </div>
        </div>
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/60 backdrop-blur-sm transition group-hover:bg-white">
          <ArrowUpRight className="h-4 w-4 text-navy-mid transition group-hover:text-navy-dark" />
        </span>
      </div>
      <div className="relative mt-auto flex items-center gap-2 text-xs">
        <span className="rounded-full bg-white/60 px-2.5 py-1 font-semibold text-navy-dark backdrop-blur-sm">
          {ind.policy_count} policies
        </span>
        <span className="rounded-full bg-white/60 px-2.5 py-1 font-semibold text-navy-dark backdrop-blur-sm">
          {ind.country_count} countries
        </span>
      </div>
    </Link>
  );
}
