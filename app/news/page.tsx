import { Newspaper, ExternalLink, AlertCircle } from "lucide-react";
import { tavilySearch, type WebResult } from "@/lib/web-search";

export const metadata = { title: "What's new · ISIP" };
// Re-fetch at most every 6 hours (ISR) — live but cached, not per-request.
export const revalidate = 21600;

const QUERY =
  "foreign direct investment screening OR CFIUS OR FDI review " +
  "new law OR decision OR blocked acquisition national security";

function host(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export default async function NewsPage() {
  let results: WebResult[] = [];
  let error: string | null = null;
  try {
    results = await tavilySearch(QUERY, { maxResults: 12, topic: "news", days: 90 });
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  return (
    <div className="space-y-6">
      <section className="glass-dark relative overflow-hidden rounded-3xl px-8 py-12 text-white">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gradient-to-br from-[#5ad7e8] to-[#19376d] opacity-40 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-gradient-to-br from-[#7c5cff] to-[#576cbc] opacity-30 blur-3xl" />
        <div className="relative max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-md">
            <Newspaper className="h-3.5 w-3.5" /> What&apos;s new
          </div>
          <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
            <span className="text-metallic-light">
              Latest investment-screening developments
            </span>
          </h1>
          <p className="max-w-2xl text-sm text-white/75">
            Live web results on FDI screening laws, reviews and notable cases —
            refreshed automatically. Always verify against the primary source.
          </p>
        </div>
      </section>

      {error ? (
        <div className="glass flex items-start gap-3 rounded-2xl p-5 text-sm text-navy-mid">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          <div>
            Couldn&apos;t load live news right now
            {/TAVILY_API_KEY/.test(error) ? " (web search not configured)" : ""}.
            Please try again later.
          </div>
        </div>
      ) : results.length === 0 ? (
        <div className="glass rounded-2xl p-5 text-sm text-navy-mid/70">
          No recent results found.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {results.map((r, i) => (
            <a
              key={i}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="glass-soft group flex flex-col rounded-2xl p-4 transition hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-navy-soft">
                {host(r.url)}
                <ExternalLink className="h-3 w-3 opacity-60" />
              </div>
              <div className="mt-1 font-bold leading-snug text-navy-dark group-hover:text-navy-soft">
                {r.title}
              </div>
              <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-navy-mid/75">
                {r.content}
              </p>
            </a>
          ))}
        </div>
      )}

      <p className="text-[11px] text-navy-mid/55">
        Results via Tavily web search · not legal advice ·{" "}
        <a href="/methodology" className="underline hover:text-navy-dark">
          methodology &amp; sources
        </a>
      </p>
    </div>
  );
}
