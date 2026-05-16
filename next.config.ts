import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Do not externalize better-auth: its React hooks must resolve to the same
  // `react` instance as the app or SSR prerender throws (e.g. useRef on null).
  serverExternalPackages: ["@prisma/client", "prisma", "pg"],
};

export default nextConfig;
