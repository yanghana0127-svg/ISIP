"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, X, ExternalLink } from "lucide-react";
import type { ISMCountry } from "@/lib/types";
import { parseThreshold } from "@/lib/threshold";
import { StrictnessInfo } from "@/components/strictness-info";

const MAX = 3;

export function CompareTool({
  countries,
  featureLabels,
  sectorGroups,
}: {
  countries: ISMCountry[];
  featureLabels: Record<string, string>;
  sectorGroups: string[];
}) {
  const sorted = [...countries].sort((a, b) => b.strictness - a.strictness);
  const [slugs, setSlugs] = useState<string[]>(
    sorted.slice(0, 2).map((c) => c.slug),
  );

  const bySlug = new Map(countries.map((c) => [c.slug, c]));
  const selected = slugs.map((s) => bySlug.get(s)).filter(Boolean) as ISMCountry[];

  const setAt = (i: number, slug: string) =>
    setSlugs((prev) => prev.map((s, j) => (j === i ? slug : s)));
  const addCol = () => {
    const next = sorted.find((c) => !slugs.includes(c.slug));
    if (next && slugs.length < MAX) setSlugs([...slugs, next.slug]);
  };
  const removeCol = (i: number) =>
    setSlugs((prev) => prev.filter((_, j) => j !== i));

  const yn = (v: number) =>
    v === 1 ? (
      <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
        Yes
      </span>
    ) : (
      <span className="inline-flex items-center rounded-full bg-navy-mid/8 px-2 py-0.5 text-[11px] text-navy-mid/45">
        No
      </span>
    );

  return (
    <div className="glass overflow-hidden rounded-2xl">
      {/* country pickers */}
      <div className="flex flex-wrap gap-2 border-b border-navy-mid/10 p-4">
        {selected.map((c, i) => (
          <div key={i} className="flex items-center gap-1">
            <select
              value={c.slug}
              onChange={(e) => setAt(i, e.target.value)}
              className="rounded-lg border border-navy-mid/20 bg-white px-2.5 py-1.5 text-sm font-semibold text-navy-dark"
            >
              {countries.map((o) => (
                <option key={o.slug} value={o.slug}>
                  {o.country}
                </option>
              ))}
            </select>
            {selected.length > 2 && (
              <button
                onClick={() => removeCol(i)}
                className="grid h-7 w-7 place-items-center rounded-full text-navy-mid/50 hover:bg-navy-mid/10 hover:text-navy-dark"
                aria-label="Remove"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        ))}
        {slugs.length < MAX && (
          <button
            onClick={addCol}
            className="inline-flex items-center gap-1 rounded-lg border border-dashed border-navy-mid/30 px-3 py-1.5 text-sm font-semibold text-navy-mid hover:border-navy-mid/50 hover:text-navy-dark"
          >
            <Plus className="h-3.5 w-3.5" /> Add country
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-white p-3 text-left text-xs font-semibold uppercase tracking-wider text-navy-mid/60">
                Dimension
              </th>
              {selected.map((c) => (
                <th
                  key={c.slug}
                  className="min-w-[150px] p-3 text-left align-bottom"
                >
                  <Link
                    href={`/countries/${c.slug}`}
                    className="inline-flex items-center gap-1 text-sm font-bold text-navy-dark hover:text-navy-soft"
                  >
                    {c.country} <ExternalLink className="h-3 w-3" />
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <Row
              label={
                <span className="inline-flex items-center gap-1">
                  Strictness Index <StrictnessInfo />
                </span>
              }
              cells={selected.map((c) => (
                <div key={c.slug} className="space-y-1">
                  <div className="flex items-baseline gap-1">
                    <span className="font-mono text-base font-bold tabular-nums text-navy-dark">
                      {c.strictness.toFixed(0)}
                    </span>
                    <span className="text-xs text-navy-mid/60">
                      #{c.strictnessRank}
                    </span>
                  </div>
                  <div className="h-1.5 w-full max-w-[130px] overflow-hidden rounded-full bg-navy-mid/10">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${c.strictness}%`,
                        background: "linear-gradient(90deg,#7c91d6,#0b2447)",
                      }}
                    />
                  </div>
                </div>
              ))}
            />
            <Row label="Mechanisms" cells={selected.map((c) => c.mechanisms)} />
            <Row
              label="Mechanism established"
              cells={selected.map((c) => c.established ?? "—")}
            />
            <Row
              label="Lead authority"
              cells={selected.map((c) => (
                <span key={c.slug} className="text-xs">
                  {c.leadAuthority ?? "—"}
                </span>
              ))}
            />
            <Row label="Coverage" cells={selected.map((c) => c.coverage ?? "—")} />
            <Row
              label="Ownership threshold"
              cells={selected.map((c) => parseThreshold(c.threshold).label)}
            />
            <Row
              label="Notification"
              cells={selected.map((c) => (
                <span key={c.slug} className="text-xs">
                  {c.notification ?? "—"}
                </span>
              ))}
            />
            <Row
              label="Review window"
              cells={selected.map((c) => c.timeframe ?? "—")}
            />
            <Row
              label="Blocs"
              cells={selected.map((c) => (
                <span key={c.slug} className="flex flex-wrap gap-1">
                  {c.oecd === 1 && <Chip>OECD</Chip>}
                  {c.eu === 1 && <Chip>EU/EEA</Chip>}
                  {c.fiveEyes === 1 && <Chip>Five Eyes</Chip>}
                  {c.oecd + c.eu + c.fiveEyes === 0 && (
                    <span className="text-navy-mid/40">—</span>
                  )}
                </span>
              ))}
            />

            <SectionRow span={selected.length + 1}>
              Sector coverage (sub-sectors screened)
            </SectionRow>
            {sectorGroups.map((g) => (
              <Row
                key={g}
                label={<span className="text-xs">{g}</span>}
                cells={selected.map((c) => c.groups?.[g] ?? 0)}
              />
            ))}

            <SectionRow span={selected.length + 1}>
              Mechanism features
            </SectionRow>
            {Object.entries(featureLabels).map(([k, lbl]) => (
              <Row
                key={k}
                label={<span className="text-xs">{lbl}</span>}
                cells={selected.map((c) => yn(c.features?.[k] ?? 0))}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Row({
  label,
  cells,
}: {
  label: React.ReactNode;
  cells: React.ReactNode[];
}) {
  return (
    <tr className="border-t border-navy-mid/8">
      <td className="sticky left-0 z-10 bg-white p-3 align-top text-sm font-medium text-navy-mid">
        {label}
      </td>
      {cells.map((c, i) => (
        <td key={i} className="p-3 align-top text-navy-dark">
          {c}
        </td>
      ))}
    </tr>
  );
}

function SectionRow({
  children,
  span,
}: {
  children: React.ReactNode;
  span: number;
}) {
  return (
    <tr>
      <td
        colSpan={span}
        className="bg-navy-mid/5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-navy-mid/70"
      >
        {children}
      </td>
    </tr>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded bg-navy-soft/15 px-1.5 py-0.5 text-[10px] font-semibold text-navy-mid">
      {children}
    </span>
  );
}
