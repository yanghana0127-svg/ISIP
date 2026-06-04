import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "ISIP — Investment Screening Intelligence Platform",
  description:
    "Search foreign investment screening laws, compare regimes and ask an AI advisor — grounded in screening statutes and the PRISM ISM dataset.",
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
        <Footer />
      </body>
    </html>
  );
}
