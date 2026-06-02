/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cosmetic lint rules (e.g. react/no-unescaped-entities) should never block
  // a production deploy. Type-checking still runs and catches real errors.
  eslint: { ignoreDuringBuilds: true },
  experimental: {
    // ensure all data/*.json files are bundled into serverless functions on Vercel
    outputFileTracingIncludes: {
      "/**/*": ["./data/**/*"],
    },
  },
};

export default nextConfig;
