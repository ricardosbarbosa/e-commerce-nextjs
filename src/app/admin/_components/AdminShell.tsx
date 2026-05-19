"use client";

import { authClient } from "@/lib/auth-client";
import { cn, formatPrice } from "@/lib/utils";
import {
  ArchiveBoxIcon,
  ClipboardDocumentListIcon,
  CubeIcon,
  HomeIcon,
  PhotoIcon,
  RectangleStackIcon,
  ShoppingBagIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { adminApi } from "./admin-api";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: HomeIcon },
  { name: "Users", href: "/admin/users", icon: UserGroupIcon },
  { name: "Products", href: "/admin/products", icon: ShoppingBagIcon },
  { name: "Inventory", href: "/admin/inventory", icon: CubeIcon },
  { name: "Categories", href: "/admin/categories", icon: RectangleStackIcon },
  { name: "Orders", href: "/admin/orders", icon: ClipboardDocumentListIcon },
];

type DashboardData = {
  queues: {
    recentOrders: {
      id: string;
      number: string;
      email: string;
      totalAmount: number;
      status: string;
      fulfillmentStatus: string;
      placedAt: string;
    }[];
    lowStockVariants: {
      id: string;
      sku: string | null;
      inventoryQuantity: number;
      product: { name: string };
    }[];
    draftProducts: { id: string; name: string; updatedAt: string }[];
  };
};

function OperationsRail() {
  const { data } = useQuery({
    queryKey: ["admin", "dashboard", "rail"],
    queryFn: () => adminApi<DashboardData>("/dashboard"),
  });

  return (
    <aside className="hidden w-80 shrink-0 border-l border-stone-200/80 bg-stone-100/70 px-5 py-6 xl:block">
      <div className="flex items-center gap-2 text-sm font-semibold text-stone-950">
        <ArchiveBoxIcon className="h-5 w-5 text-amber-700" />
        Operations rail
      </div>
      <div className="mt-6 space-y-6">
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
            Fulfillment desk
          </h2>
          <div className="mt-3 space-y-2">
            {(data?.queues.recentOrders ?? []).slice(0, 4).map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="block rounded-xl border border-stone-200 bg-white/80 p-3 text-sm shadow-sm transition hover:border-amber-300"
              >
                <span className="font-medium text-stone-950">
                  {order.number}
                </span>
                <span className="mt-1 block text-stone-500">{order.email}</span>
                <span className="mt-2 block font-mono text-xs text-stone-600">
                  {formatPrice(order.totalAmount, "USD")} ·{" "}
                  {order.fulfillmentStatus.replaceAll("_", " ")}
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
            Stock watch
          </h2>
          <div className="mt-3 space-y-2">
            {(data?.queues.lowStockVariants ?? [])
              .slice(0, 4)
              .map((variant) => (
                <Link
                  key={variant.id}
                  href="/admin/inventory"
                  className="flex items-center justify-between rounded-xl border border-stone-200 bg-white/80 p-3 text-sm shadow-sm transition hover:border-amber-300"
                >
                  <span>
                    <span className="block font-medium text-stone-950">
                      {variant.product.name}
                    </span>
                    <span className="block font-mono text-xs text-stone-500">
                      {variant.sku ?? "NO-SKU"}
                    </span>
                  </span>
                  <span className="rounded-full bg-amber-100 px-2 py-1 font-mono text-xs text-amber-900">
                    {variant.inventoryQuantity}
                  </span>
                </Link>
              ))}
          </div>
        </section>

        <section>
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
            Draft shelf
          </h2>
          <div className="mt-3 space-y-2">
            {(data?.queues.draftProducts ?? []).slice(0, 4).map((product) => (
              <Link
                key={product.id}
                href={`/admin/products/${product.id}`}
                className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white/80 p-3 text-sm shadow-sm transition hover:border-amber-300"
              >
                <PhotoIcon className="h-4 w-4 text-stone-400" />
                <span className="font-medium text-stone-950">
                  {product.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </aside>
  );
}

function AdminFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();

  return (
    <div className="min-h-screen bg-stone-100 text-stone-950">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 border-r border-stone-200/80 bg-stone-100 px-4 py-5 lg:block">
          <Link href="/admin" className="block rounded-2xl bg-stone-950 p-4">
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-200">
              Commerce
            </span>
            <span className="mt-2 block text-lg font-semibold text-white">
              Operations desk
            </span>
          </Link>
          <nav className="mt-6 space-y-1">
            {navigation.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/admin" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                    active
                      ? "bg-white text-stone-950 shadow-sm ring-1 ring-stone-200"
                      : "text-stone-600 hover:bg-white/70 hover:text-stone-950",
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="border-b border-stone-200/80 bg-stone-100/95 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
                  Admin
                </p>
                <h1 className="mt-1 text-xl font-semibold text-stone-950">
                  Back-office control
                </h1>
              </div>
              <div className="text-right text-sm">
                <p className="font-medium text-stone-950">
                  {session?.user.name ?? "Admin"}
                </p>
                <button
                  type="button"
                  onClick={() => authClient.signOut()}
                  className="mt-1 text-stone-500 underline-offset-4 hover:text-stone-950 hover:underline"
                >
                  Sign out
                </button>
              </div>
            </div>
          </header>
          <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>

        <OperationsRail />
      </div>
    </div>
  );
}

export default function AdminShell({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AdminFrame>{children}</AdminFrame>
    </QueryClientProvider>
  );
}
