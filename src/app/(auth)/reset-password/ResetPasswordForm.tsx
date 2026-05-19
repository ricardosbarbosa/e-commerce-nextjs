"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { authClient } from "@/lib/auth-client";

export default function ResetPasswordForm({
  token,
  tokenError,
}: {
  token: string | null;
  tokenError: string | null;
}) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(tokenError);
  const [success, setSuccess] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("The reset link is missing or invalid.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setPending(true);

    try {
      const { error: resetError } = await authClient.resetPassword({
        token,
        newPassword: password,
      });

      if (resetError) {
        setError(resetError.message ?? "Could not reset password.");
        return;
      }

      setSuccess(true);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h1 className="text-center text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
        Choose a new password
      </h1>
      <p className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">
        Your reset link can only be used once.
      </p>

      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="reset-password"
            className="text-sm font-medium text-zinc-800 dark:text-zinc-200"
          >
            New password
          </label>
          <input
            id="reset-password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 outline-none ring-zinc-950/10 placeholder:text-zinc-400 focus:border-zinc-950 focus:ring-4 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-300"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="reset-password-confirm"
            className="text-sm font-medium text-zinc-800 dark:text-zinc-200"
          >
            Confirm password
          </label>
          <input
            id="reset-password-confirm"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 outline-none ring-zinc-950/10 placeholder:text-zinc-400 focus:border-zinc-950 focus:ring-4 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-300"
          />
        </div>

        {success ? (
          <p
            className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200"
            role="status"
          >
            Password reset. You can now sign in with the new password.
          </p>
        ) : null}

        {error ? (
          <p
            className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950/50 dark:text-red-200"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending || success || !token}
          className="mt-2 flex h-11 items-center justify-center rounded-lg bg-zinc-950 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
        >
          {pending ? "Resetting…" : "Reset password"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
        <Link
          href="/sign-in"
          className="font-medium text-zinc-950 underline-offset-4 hover:underline dark:text-zinc-50"
        >
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
