import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";

export const metadata: Metadata = {
  title: "ISIP — Investment Screening Intelligence Platform",
  description:
    "Search foreign investment screening policies, cases and an AI advisor across 34 countries and 141 legal documents.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen text-[#0b2447]">
        <div className="blob-bg" aria-hidden="true">
          <span className="blob blob-1" />
          <span className="blob blob-2" />
          <span className="blob blob-3" />
        </div>

        <Navbar />
        <main className="mx-auto w-full max-w-7xl px-4 py-8">{children}</main>
        <footer className="mx-auto mt-12 max-w-7xl px-4 pb-10 text-center text-xs text-navy-mid/60">
          Investment Screening Intelligence Platform · ISIP · 2026
        </footer>
      </body>
    </html>
  );
}
