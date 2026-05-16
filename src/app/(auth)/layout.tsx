import Link from "next/link";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "E-commerce",
  description: "Next.js storefront with Better Auth",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <div className="flex min-h-full flex-1 flex-col bg-zinc-50 px-4 py-12 dark:bg-zinc-950">
          <div className="mx-auto w-full max-w-sm">
            <p className="mb-8 text-center">
              <Link
                href="/"
                className="text-sm font-medium text-zinc-600 underline-offset-4 hover:text-zinc-950 hover:underline dark:text-zinc-400 dark:hover:text-zinc-50"
              >
                ← Home
              </Link>
            </p>
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
