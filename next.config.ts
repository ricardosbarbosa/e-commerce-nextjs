import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Do not externalize better-auth: its React hooks must resolve to the same
  // `react` instance as the app or SSR prerender throws (e.g. useRef on null).
  serverExternalPackages: ["@prisma/client", "prisma", "pg"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "tailwindcss.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
      },
      {
        protocol: "https",
        hostname: "https://u7zjotnwf20vfcup.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
