import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        navy: {
          dark: "#0B2447",
          mid: "#19376D",
          soft: "#576CBC",
          light: "#A5D7E8",
        },
        gold: "#C9A227",
      },
      fontFamily: {
        sans: [
          "PingFang SC",
          "Hiragino Sans GB",
          "Microsoft YaHei",
          "system-ui",
          "sans-serif",
        ],
      },
      boxShadow: {
        softcard: "0 1px 2px rgba(11,36,71,0.08), 0 4px 12px rgba(11,36,71,0.06)",
        navy: "0 2px 8px rgba(11,36,71,0.25)",
      },
    },
  },
  plugins: [],
};
export default config;
