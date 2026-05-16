"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";

export function UserMenu() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <span className="text-sm tabular-nums text-[#5c5854] dark:text-[#9c9894]">
        …
      </span>
    );
  }

  if (!session?.user) {
    return (
      <nav className="flex items-center gap-6 text-sm font-medium tracking-wide">
        <Link
          href="/sign-in"
          className="text-[#1a1814] underline decoration-[#c4a574] decoration-2 underline-offset-4 transition hover:text-[#8b4513] dark:text-[#ebe8e3] dark:decoration-[#8b7355] dark:hover:text-[#d4a574]"
        >
          Sign in
        </Link>
        <Link
          href="/sign-up"
          className="rounded-full border border-[#1a1814]/15 bg-[#1a1814] px-4 py-2 text-[#f4f1ec] transition hover:bg-[#2a2620] dark:border-[#ebe8e3]/20 dark:bg-[#ebe8e3] dark:text-[#11100e] dark:hover:bg-white"
        >
          Sign up
        </Link>
      </nav>
    );
  }

  const displayName = session.user.name?.trim() || session.user.email;

  return (
    <div className="flex flex-wrap items-center justify-end gap-4 text-sm">
      <Link
        href="/account"
        className="text-[#1a1814] underline decoration-[#c4a574] decoration-2 underline-offset-4 transition hover:text-[#8b4513] dark:text-[#ebe8e3] dark:decoration-[#8b7355] dark:hover:text-[#d4a574]"
      >
        Account
      </Link>
      <p className="text-right leading-tight">
        <span className="block text-xs font-medium uppercase tracking-widest text-[#6b6560] dark:text-[#9c9894]">
          Signed in as
        </span>
        <span className="font-semibold text-[#1a1814] dark:text-[#f4f1ec]">
          {displayName}
        </span>
      </p>
      <button
        type="button"
        onClick={async () => {
          await authClient.signOut();
          router.refresh();
        }}
        className="rounded-full border border-[#8b4513]/40 px-4 py-2 font-medium text-[#8b4513] transition hover:border-[#8b4513] hover:bg-[#8b4513]/10 dark:border-[#d4a574]/50 dark:text-[#d4a574] dark:hover:bg-[#d4a574]/10"
      >
        Log out
      </button>
    </div>
  );
}
