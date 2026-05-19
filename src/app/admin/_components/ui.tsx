import { cn } from "@/lib/utils";
import type { ComponentProps, ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-stone-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">
          {eyebrow}
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-stone-950">
          {title}
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-stone-600">{description}</p>
      </div>
      {action}
    </div>
  );
}

export function Card({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-stone-200 bg-white/90 shadow-sm",
        className,
      )}
      {...props}
    />
  );
}

export function Button({ className, ...props }: ComponentProps<"button">) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl bg-stone-950 px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export function SecondaryButton({
  className,
  ...props
}: ComponentProps<"button">) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-sm font-medium text-stone-700 shadow-sm transition hover:border-stone-300 hover:text-stone-950 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block text-sm font-medium text-stone-700">
      {label}
      <span className="mt-1 block">{children}</span>
    </label>
  );
}

export const inputClassName =
  "block w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-950 shadow-inner outline-none transition placeholder:text-stone-400 focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-200";

export function StatusBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-700 ring-1 ring-stone-200">
      {children}
    </span>
  );
}
