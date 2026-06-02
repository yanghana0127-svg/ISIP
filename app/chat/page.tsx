import Link from "next/link";
import {
  ArrowLeft,
  MessageSquare,
  BookOpen,
  Globe,
  Layers3,
} from "lucide-react";
import { ChatRoom } from "@/components/chat-room";
import { ChatHeaderBadge } from "@/components/chat-room";

export default function ChatPage({
  searchParams,
}: {
  searchParams: { industry?: string; country?: string; policy?: string };
}) {
  const { industry, country, policy } = searchParams;

  return (
    <>
      {/* Fullscreen metallic blue gradient — sits ABOVE the home blob-bg (z:-1)
          and BELOW the content (z:10). Background-attachment: fixed so it stays
          put while scrolling. */}
      <div
        aria-hidden
        className="bg-chat-metal fixed inset-0"
        style={{ zIndex: 0 }}
      />
      {/* subtle film-grain / noise overlay for metallic texture */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{
          zIndex: 1,
          mixBlendMode: "overlay",
          opacity: 0.18,
          background:
            "radial-gradient(rgba(255,255,255,0.5) 1px, transparent 1px) 0 0 / 3px 3px",
        }}
      />

      <div className="relative z-10 space-y-8 text-white">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-white/65 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>

        <header className="space-y-3">
          <div className="flex items-center gap-2 text-white/55">
            <MessageSquare className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              AI Advisor
            </span>
          </div>
          <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-6xl">
            <span className="text-metallic-static">Ask anything,</span>
            <span className="block text-metallic-static">get cited answers.</span>
          </h1>
          <p className="max-w-xl text-sm text-white/75 md:text-base">
            Retrieves across 141 statutes and live web sources, cites every
            answer.
          </p>
          {(industry || country || policy) && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {industry && (
                <ChatHeaderBadge>Sector context · {industry}</ChatHeaderBadge>
              )}
              {country && (
                <ChatHeaderBadge>Country context · {country}</ChatHeaderBadge>
              )}
              {policy && (
                <ChatHeaderBadge>Policy context · locked</ChatHeaderBadge>
              )}
            </div>
          )}
        </header>

        {/* Three mode-introduction cards — aligned in a row, equal height */}
        <section className="grid gap-4 md:grid-cols-3">
          <ModeCard
            icon={<BookOpen className="h-5 w-5" />}
            tag="Policy"
            title="Locate the clause"
            desc="Vector search across 141 statutes. Best when you want the exact wording of a rule."
          />
          <ModeCard
            icon={<Globe className="h-5 w-5" />}
            tag="Web"
            title="Live evidence"
            desc="Tavily web search for breaking decisions, news and recent enforcement actions."
          />
          <ModeCard
            icon={<Layers3 className="h-5 w-5" />}
            tag="Deep Research"
            title="Full opinion"
            desc="Combines statutes and live web. Outputs Landscape · Developments · Risks · Recommendations."
          />
        </section>

        <ChatRoom industry={industry} country={country} />
      </div>
    </>
  );
}

function ModeCard({
  icon,
  tag,
  title,
  desc,
}: {
  icon: React.ReactNode;
  tag: string;
  title: string;
  desc: string;
}) {
  return (
    <div
      className="flex h-full flex-col rounded-2xl border border-white/15 p-5 backdrop-blur"
      style={{ background: "rgba(255,255,255,0.05)" }}
    >
      {/* row 1: icon + tag — fixed height */}
      <div className="flex h-9 items-center gap-2">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/12 text-white">
          {icon}
        </span>
        <span className="text-xs font-bold uppercase tracking-wider text-white/65">
          {tag}
        </span>
      </div>
      {/* row 2: title — fixed line height block */}
      <div className="mt-3 text-lg font-bold leading-tight text-white">
        {title}
      </div>
      {/* row 3: desc — fills remaining */}
      <div className="mt-2 flex-1 text-sm leading-relaxed text-white/70">
        {desc}
      </div>
    </div>
  );
}
