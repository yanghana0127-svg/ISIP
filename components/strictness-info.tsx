"use client";

import { useState } from "react";
import Link from "next/link";
import { HelpCircle } from "lucide-react";
import meta from "@/data/ism_meta.json";

const LABELS: Record<string, string> = {
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

// Small "?" affordance that explains how the Screening Strictness Index is
// computed. Sourced from data/ism_meta.json so it stays in sync with the pipeline.
export function StrictnessInfo({
  className = "",
  tone = "dark",
}: {
  className?: string;
  tone?: "dark" | "light";
}) {
  const [open, setOpen] = useState(false);
  const weights = meta.strictness.weights as Record<string, number>;
  const entries = Object.entries(weights).sort((a, b) => b[1] - a[1]);

  return (
    <span className={`relative inline-flex align-middle ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="How is the Strictness Index calculated?"
        className={`grid h-4 w-4 place-items-center rounded-full transition ${
          tone === "light"
            ? "text-white/70 hover:text-white"
            : "text-navy-mid/60 hover:text-navy-dark"
        }`}
      >
        <HelpCircle className="h-3.5 w-3.5" />
      </button>

      {open && (
        <>
          <button
            aria-hidden
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
          />
          <div className="absolute left-1/2 top-6 z-50 w-72 -translate-x-1/2 rounded-xl border border-navy-mid/15 bg-white p-3 text-left shadow-xl">
            <div className="text-xs font-bold text-navy-dark">
              Screening Strictness Index
            </div>
            <p className="mt-1 text-[11px] leading-snug text-navy-mid/80">
              {meta.strictness.note} A weighted sum of ISM mechanism features is
              normalised to 0–100 (max raw weight {meta.strictness.max}).
            </p>
            <div className="mt-2 max-h-44 space-y-0.5 overflow-y-auto">
              {entries.map(([k, w]) => (
                <div
                  key={k}
                  className="flex items-center justify-between text-[11px]"
                >
                  <span className="text-navy-mid/85">{LABELS[k] ?? k}</span>
                  <span className="font-mono font-semibold text-navy-dark">
                    ×{w}
                  </span>
                </div>
              ))}
            </div>
            <Link
              href="/methodology"
              className="mt-2 inline-block text-[11px] font-semibold text-navy-soft hover:text-navy-dark"
            >
              Full methodology →
            </Link>
          </div>
        </>
      )}
    </span>
  );
}
