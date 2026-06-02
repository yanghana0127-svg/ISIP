/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // ensure all data/*.json files are bundled into serverless functions on Vercel
    outputFileTracingIncludes: {
      "/**/*": ["./data/**/*"],
    },
  },
};

export default nextConfig;
