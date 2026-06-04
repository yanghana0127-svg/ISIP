import Link from "next/link";
import type { PolicyMeta } from "@/lib/types";
import { FileText, Calendar, MapPin } from "lucide-react";

export function PolicyCard({
  policy,
  highlight,
}: {
  policy: PolicyMeta;
  highlight?: string;
}) {
  return (
    <Link
      href={`/policies/${policy.id}`}
      className="group glass flex flex-col gap-2 rounded-2xl p-4 transition hover:-translate-y-0.5 hover:shadow-xl"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold leading-snug text-navy-dark group-hover:text-navy-mid">
          {highlight ? renderHighlight(policy.title, highlight) : policy.title}
        </h3>
        <FileText className="mt-0.5 h-4 w-4 shrink-0 text-navy-soft" />
      </div>
      <div className="flex flex-wrap items-center gap-3 text-xs text-navy-mid/80">
        <span className="inline-flex items-center gap-1">
          <MapPin className="h-3 w-3" /> {policy.country}
        </span>
        {policy.year && (
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3 w-3" /> {policy.year}
          </span>
        )}
        <span className="text-navy-mid/60">
          {(policy.length / 1000).toFixed(1)}k chars
        </span>
      </div>
      {policy.industries.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-1">
          {policy.industries.slice(0, 4).map((s) => (
            <span
              key={s}
              className="rounded-full bg-white/55 px-2 py-0.5 text-[10px] font-semibold text-navy-mid backdrop-blur-sm"
            >
              {s}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}

function renderHighlight(text: string, q: string) {
  if (!q.trim()) return text;
  const terms = q.split(/\s+/).filter(Boolean);
  if (!terms.length) return text;
  const re = new RegExp(
    `(${terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
    "gi",
  );
  const parts = text.split(re);
  return parts.map((p, i) =>
    re.test(p) ? (
      <mark key={i} className="highlight-hit">
        {p}
      </mark>
    ) : (
      <span key={i}>{p}</span>
    ),
  );
}
