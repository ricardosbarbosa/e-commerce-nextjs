import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  const { user } = session;

  return (
    <div className="mx-auto flex min-h-full max-w-lg flex-col justify-center px-6 py-16">
      <p className="text-sm font-medium uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
        Private
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
        Account
      </h1>
      <p className="mt-4 text-zinc-600 dark:text-zinc-400">
        This page is only visible when you have a valid session.
      </p>
      <dl className="mt-8 space-y-4 rounded-xl border border-zinc-200 bg-white p-6 text-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div>
          <dt className="text-zinc-500 dark:text-zinc-400">Name</dt>
          <dd className="mt-1 font-medium text-zinc-950 dark:text-zinc-50">
            {user.name ?? "—"}
          </dd>
        </div>
        <div>
          <dt className="text-zinc-500 dark:text-zinc-400">Email</dt>
          <dd className="mt-1 font-medium text-zinc-950 dark:text-zinc-50">
            {user.email}
          </dd>
        </div>
      </dl>
      <Link
        href="/"
        className="mt-8 text-sm font-medium text-zinc-700 underline decoration-zinc-400 underline-offset-4 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-50"
      >
        ← Back to store
      </Link>
    </div>
  );
}
