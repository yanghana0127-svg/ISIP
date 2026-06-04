import Link from "next/link";

export function Footer() {
  return (
    <footer className="mx-auto mt-12 max-w-7xl px-4 pb-10">
      <div className="glass-soft rounded-2xl px-5 py-4 text-xs text-navy-mid/70">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-semibold text-navy-mid">
            ISIP · Investment Screening Intelligence Platform
          </span>
          <nav className="flex flex-wrap items-center gap-3">
            <Link href="/methodology" className="hover:text-navy-dark">
              Methodology &amp; sources
            </Link>
            <Link href="/news" className="hover:text-navy-dark">
              What&apos;s new
            </Link>
            <Link href="/chat" className="hover:text-navy-dark">
              AI Advisor
            </Link>
          </nav>
        </div>
        <p className="mt-2 leading-relaxed text-navy-mid/60">
          Informational research tool — <strong>not legal advice</strong>.
          Structured data from the PRISM ISM dataset (Bauerle Danzman &amp;
          Meunier); statute texts belong to their respective governments. Verify
          against primary sources before acting.
        </p>
      </div>
    </footer>
  );
}
