// Normalize the free-text ISM "Threshold" field into a comparable percentage.
// Examples seen in the data: "0.1", "0.25", "10%", "none", "-", "case by case".
export type ParsedThreshold = {
  pct: number | null; // ownership % when numeric, else null
  label: string; // human-readable
};

export function parseThreshold(raw: string | null | undefined): ParsedThreshold {
  if (raw == null) return { pct: null, label: "—" };
  const s = String(raw).trim();
  if (!s || s === "-" || /^(none|n\/?a|no threshold)$/i.test(s)) {
    return { pct: null, label: s && s !== "-" ? s : "None" };
  }

  // explicit percentage, e.g. "10%" or "10 %"
  const pctMatch = s.match(/(\d+(?:\.\d+)?)\s*%/);
  if (pctMatch) {
    const pct = parseFloat(pctMatch[1]);
    return { pct, label: `${trimNum(pct)}%` };
  }

  // bare number: 0–1 → fraction, >1 → already a percent
  const numMatch = s.match(/^\d+(?:\.\d+)?$/);
  if (numMatch) {
    const n = parseFloat(s);
    const pct = n > 0 && n <= 1 ? n * 100 : n;
    return { pct, label: `${trimNum(pct)}%` };
  }

  // free text (e.g. "case by case") — keep as-is, no numeric value
  return { pct: null, label: s };
}

function trimNum(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}
