import { NextRequest, NextResponse } from "next/server";
import MiniSearch from "minisearch";
import { getAllPolicies, getAllPoliciesMeta } from "@/lib/data";
import type { PolicyMeta } from "@/lib/types";

export const runtime = "nodejs";

type IndexDoc = PolicyMeta & { snippet: string };

let _index: MiniSearch<IndexDoc> | null = null;

async function getIndex() {
  if (_index) return _index;
  const policies = await getAllPolicies();
  const docs: IndexDoc[] = policies.map((p) => {
    const { text, ...meta } = p;
    return { ...meta, snippet: text.slice(0, 5000) };
  });
  const idx = new MiniSearch<IndexDoc>({
    fields: ["title", "country", "industries", "snippet"],
    storeFields: [
      "id",
      "country",
      "country_slug",
      "title",
      "year",
      "length",
      "industries",
      "filename",
      "source_type",
    ],
    searchOptions: {
      fuzzy: 0.15,
      prefix: true,
      boost: { title: 3, country: 2, industries: 1.5 },
    },
  });
  idx.addAll(docs);
  _index = idx;
  return idx;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();
  const country = searchParams.get("country") ?? "";
  const industry = searchParams.get("industry") ?? "";
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "60", 10), 200);

  let results: PolicyMeta[];

  if (q.length === 0) {
    results = await getAllPoliciesMeta();
  } else {
    const idx = await getIndex();
    const hits = idx.search(q, { combineWith: "AND" });
    const merged = [...hits];
    if (merged.length < 5) {
      const more = idx.search(q, { combineWith: "OR" });
      const seen = new Set(merged.map((h) => h.id));
      for (const h of more) {
        if (!seen.has(h.id)) merged.push(h);
        if (merged.length >= limit) break;
      }
    }
    results = merged.slice(0, limit).map((h) => h as unknown as PolicyMeta);
  }

  if (country) results = results.filter((p) => p.country_slug === country);
  if (industry) results = results.filter((p) => p.industries.includes(industry));

  return NextResponse.json({
    query: q,
    total: results.length,
    results: results.slice(0, limit),
  });
}
