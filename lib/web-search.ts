import "server-only";

export type WebResult = {
  title: string;
  url: string;
  content: string;
  score?: number;
};

/**
 * Tavily search — purpose-built for AI Agents.
 * Returns clean text snippets (no HTML), already deduplicated and ranked.
 */
export async function tavilySearch(
  query: string,
  opts: { maxResults?: number; topic?: "general" | "news"; days?: number } = {},
): Promise<WebResult[]> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) throw new Error("TAVILY_API_KEY not set");
  const body = {
    query,
    search_depth: "advanced",
    max_results: opts.maxResults ?? 6,
    topic: opts.topic ?? "general",
    include_answer: false,
    include_raw_content: false,
    ...(opts.days ? { days: opts.days } : {}),
  };
  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Tavily error: ${res.status} ${await res.text()}`);
  }
  const json = await res.json();
  return (json.results ?? []).map(
    (r: { title?: string; url?: string; content?: string; score?: number }) => ({
      title: r.title ?? "",
      url: r.url ?? "",
      content: r.content ?? "",
      score: r.score,
    }),
  );
}
