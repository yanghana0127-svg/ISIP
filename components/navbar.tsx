"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass } from "lucide-react";

// Compare lives under /countries (reachable from that page) so it's not a
// top-level item. AI Advisor is the flagship → a distinct CTA on the right.
const LINKS = [
  { href: "/", label: "Home" },
  { href: "/countries", label: "Countries" },
  { href: "/policies", label: "Policies" },
  { href: "/news", label: "News" },
  { href: "/guide", label: "Guide" },
];

export function Navbar() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);
  const chatActive = pathname.startsWith("/chat");

  return (
    <header className="sticky top-3 z-40 mx-auto mt-3 max-w-7xl px-4">
      <div className="glass flex h-14 items-center gap-3 rounded-2xl px-5">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold tracking-tight text-navy-dark"
        >
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-navy-mid to-navy-soft text-white shadow-sm">
            <Compass className="h-4 w-4" />
          </span>
          <span className="text-gradient-navy">ISIP</span>
          <span className="hidden text-xs font-normal text-navy-mid/60 lg:inline">
            Investment Screening Intelligence Platform
          </span>
        </Link>

        <nav className="ml-auto flex items-center gap-0.5 text-sm">
          {LINKS.map((l) => {
            const active = isActive(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`relative rounded-lg px-2.5 py-1.5 transition ${
                  active
                    ? "bg-white/70 font-semibold text-navy-dark shadow-sm"
                    : "font-medium text-navy-mid hover:bg-white/45 hover:text-navy-dark"
                }`}
              >
                {l.label}
                {active && (
                  <span className="absolute inset-x-2.5 -bottom-0.5 h-0.5 rounded-full bg-gradient-to-r from-navy-soft to-navy-light" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* flagship CTA — frosted glass */}
        <Link
          href="/chat"
          aria-current={chatActive ? "page" : undefined}
          className={`glass-cta ml-1 inline-flex items-center rounded-xl px-4 py-1.5 text-sm font-semibold tracking-tight ${
            chatActive ? "ring-2 ring-navy-light/60" : ""
          }`}
        >
          AI Advisor
        </Link>
      </div>
    </header>
  );
}
