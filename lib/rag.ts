import "server-only";
import { promises as fs } from "fs";
import path from "path";

export type Chunk = {
  id: string;
  policy_id: string;
  country: string;
  country_slug: string;
  title: string;
  year: number | null;
  industries: string[];
  text: string;
  embedding: number[];
};

let _chunks: Chunk[] | null = null;
let _dim = 0;

export async function loadChunks(): Promise<Chunk[]> {
  if (_chunks) return _chunks;
  const raw = await fs.readFile(
    path.join(process.cwd(), "data", "chunks.json"),
    "utf-8",
  );
  _chunks = JSON.parse(raw) as Chunk[];
  _dim = _chunks[0]?.embedding.length ?? 0;
  return _chunks;
}

export function getEmbeddingDim() {
  return _dim;
}

export function cosine(a: number[], b: number[]): number {
  let dot = 0,
    na = 0,
    nb = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) {
    const x = a[i],
      y = b[i];
    dot += x * y;
    na += x * x;
    nb += y * y;
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-9);
}

export async function embedQuery(text: string): Promise<number[]> {
  const apiKey = process.env.ZHIPU_API_KEY;
  if (!apiKey) throw new Error("ZHIPU_API_KEY not set");
  const res = await fetch("https://open.bigmodel.cn/api/paas/v4/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "embedding-3",
      input: text,
      dimensions: 1024,
    }),
  });
  if (!res.ok) {
    throw new Error(`Zhipu embed failed: ${res.status} ${await res.text()}`);
  }
  const json = await res.json();
  return json.data[0].embedding as number[];
}

export type RetrievedChunk = Chunk & { score: number };

export async function retrieve(
  query: string,
  topK = 8,
  filters?: { country_slug?: string; industry?: string },
  queryEmb?: number[],
): Promise<RetrievedChunk[]> {
  const q = queryEmb ?? (await embedQuery(query));
  const chunks = await loadChunks();

  const filtered = chunks.filter((c) => {
    if (filters?.country_slug && c.country_slug !== filters.country_slug)
      return false;
    if (filters?.industry && !c.industries.includes(filters.industry))
      return false;
    return true;
  });

  const scored = filtered.map((c) => ({
    ...c,
    score: cosine(q, c.embedding),
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}

// ── ISM structured source (PRISM Investment Screening Mechanism data) ──
export type ISMRecord = {
  id: string;
  country: string;
  country_slug: string;
  year: number | null;
  lead_authority: string | null;
  established: number | null;
  source: "ism";
  text: string;
  embedding: number[];
};
export type RetrievedISM = ISMRecord & { score: number };

let _ism: ISMRecord[] | null = null;

export async function loadISM(): Promise<ISMRecord[]> {
  if (_ism) return _ism;
  const raw = await fs.readFile(
    path.join(process.cwd(), "data", "ism.json"),
    "utf-8",
  );
  _ism = JSON.parse(raw) as ISMRecord[];
  return _ism;
}

export async function retrieveISM(
  query: string,
  topK = 3,
  filters?: { country_slug?: string },
  queryEmb?: number[],
): Promise<RetrievedISM[]> {
  const q = queryEmb ?? (await embedQuery(query));
  const recs = await loadISM();
  const filtered = filters?.country_slug
    ? recs.filter((r) => r.country_slug === filters.country_slug)
    : recs;
  const pool = filtered.length > 0 ? filtered : recs;
  const scored = pool.map((r) => ({ ...r, score: cosine(q, r.embedding) }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}
