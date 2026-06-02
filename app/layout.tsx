import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";

export const metadata: Metadata = {
  title: "投资审查智能平台 ISIP",
  description:
    "跨国投资审查政策检索、案例分析与 AI 顾问，覆盖 34 国 141 份审查法规",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen text-[#0b2447]">
        <div className="blob-bg" aria-hidden="true">
          <span className="blob blob-1" />
          <span className="blob blob-2" />
          <span className="blob blob-3" />
        </div>

        <Navbar />
        <main className="mx-auto w-full max-w-7xl px-4 py-8">{children}</main>
        <footer className="mx-auto mt-12 max-w-7xl px-4 pb-10 text-center text-xs text-navy-mid/60">
          投资审查智能平台 ISIP 2026
        </footer>
      </body>
    </html>
  );
}
