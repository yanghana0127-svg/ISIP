import Link from "next/link";
import { Compass } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-3 z-40 mx-auto mt-3 max-w-7xl px-4">
      <div className="glass flex h-14 items-center gap-6 rounded-2xl px-5">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold tracking-tight text-navy-dark"
        >
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-navy-mid to-navy-soft text-white shadow-sm">
            <Compass className="h-4 w-4" />
          </span>
          <span className="text-gradient-navy">ISIP</span>
          <span className="hidden text-xs font-normal text-navy-mid/60 md:inline">
            Investment Screening Intelligence Platform
          </span>
        </Link>
        <nav className="ml-auto flex items-center gap-1 text-sm">
          <NavLink href="/">Home</NavLink>
          <NavLink href="/policies">Policies</NavLink>
          <NavLink href="/chat">AI Advisor</NavLink>
        </nav>
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-lg px-3 py-1.5 text-navy-mid transition hover:bg-white/40 hover:text-navy-dark"
    >
      {children}
    </Link>
  );
}
