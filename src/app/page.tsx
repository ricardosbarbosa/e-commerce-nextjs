import Link from "next/link";
import { Playfair_Display } from "next/font/google";

import { UserMenu } from "@/components/user-menu";

export const dynamic = "force-dynamic";

const display = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export default function Home() {
  return (
    <div
      className={`${display.variable} relative flex min-h-full flex-1 flex-col overflow-hidden bg-[#f4f1ec] text-[#1a1814] dark:bg-[#0e0d0c] dark:text-[#ebe8e3]`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-[0.2]"
        aria-hidden
        style={{
          backgroundImage: `radial-gradient(ellipse 80% 50% at 50% -20%, rgba(139, 69, 19, 0.12), transparent),
            radial-gradient(ellipse 60% 40% at 100% 0%, rgba(196, 165, 116, 0.15), transparent)`,
        }}
      />

      <header className="relative z-10 flex items-center justify-between border-b border-[#1a1814]/8 px-6 py-5 dark:border-[#ebe8e3]/10 sm:px-10">
        <Link
          href="/"
          className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[#5c5854] dark:text-[#9c9894]"
        >
          Shop
        </Link>
        <UserMenu />
      </header>

      <main className="relative z-10 flex flex-1 flex-col justify-center px-6 pb-24 pt-16 sm:px-10 sm:pb-32 sm:pt-20">
        <div className="mx-auto w-full max-w-xl animate-[home-enter_0.7s_ease-out_both]">
          <p className="mb-4 font-mono text-xs font-medium uppercase tracking-[0.25em] text-[#8b4513] dark:text-[#c4a574]">
            E-commerce Next.js
          </p>
          <h1
            className={`${display.className} text-4xl font-normal leading-[1.15] tracking-tight text-[#1a1814] sm:text-5xl dark:text-[#f4f1ec]`}
          >
            A quiet storefront, ready when you are.
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-[#5c5854] dark:text-[#b8b3ad]">
            Auth, API, and catalog wiring in one place. Sign in to see your name
            in the header, or continue as a guest while you build.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/api"
              className="inline-flex items-center gap-2 rounded-full bg-[#1a1814] px-6 py-3 text-sm font-semibold text-[#f4f1ec] transition hover:bg-[#2a2620] dark:bg-[#ebe8e3] dark:text-[#11100e] dark:hover:bg-white"
            >
              API root
              <span aria-hidden className="text-lg leading-none">
                →
              </span>
            </Link>
            <Link
              href="/api/openapi/json"
              className="inline-flex items-center rounded-full border border-[#1a1814]/20 px-6 py-3 text-sm font-semibold text-[#1a1814] transition hover:border-[#1a1814]/40 hover:bg-[#1a1814]/5 dark:border-[#ebe8e3]/25 dark:text-[#ebe8e3] dark:hover:bg-[#ebe8e3]/10"
            >
              OpenAPI JSON
            </Link>
          </div>
        </div>
      </main>

      <footer className="relative z-10 border-t border-[#1a1814]/8 px-6 py-6 text-center text-xs text-[#6b6560] dark:border-[#ebe8e3]/10 dark:text-[#7a756f] sm:px-10">
        Built with Next.js, Elysia, Prisma, and Better Auth.
      </footer>

      <style>{`
        @keyframes home-enter {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
