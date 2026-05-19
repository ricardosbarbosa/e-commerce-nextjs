"use client";

import { formatPrice } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { adminApi } from "./_components/admin-api";
import { Card, PageHeader, StatusBadge } from "./_components/ui";

type DashboardData = {
  metrics: {
    totalUsers: number;
    activeProducts: number;
    draftProducts: number;
    openOrders: number;
    lowStockVariants: number;
  };
  queues: {
    recentOrders: {
      id: string;
      number: string;
      email: string;
      totalAmount: number;
      fulfillmentStatus: string;
    }[];
    lowStockVariants: {
      id: string;
      sku: string | null;
      inventoryQuantity: number;
      product: { name: string };
    }[];
    draftProducts: { id: string; name: string }[];
  };
};

export default function AdminDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: () => adminApi<DashboardData>("/dashboard"),
  });

  const metrics = data?.metrics;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operations"
        title="Today’s desk"
        description="A compact command surface for customer accounts, catalog readiness, inventory pressure, and fulfillment work."
      />

      <div className="grid gap-4 md:grid-cols-5">
        {[
          ["Users", metrics?.totalUsers],
          ["Active products", metrics?.activeProducts],
          ["Drafts", metrics?.draftProducts],
          ["Open orders", metrics?.openOrders],
          ["Low stock", metrics?.lowStockVariants],
        ].map(([label, value]) => (
          <Card key={label} className="p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
              {label}
            </p>
            <p className="mt-3 font-mono text-3xl font-semibold text-stone-950">
              {isLoading ? "..." : value}
            </p>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="p-5">
          <h2 className="font-semibold text-stone-950">Fulfillment queue</h2>
          <div className="mt-4 space-y-3">
            {(data?.queues.recentOrders ?? []).map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="block rounded-xl border border-stone-200 bg-stone-50 p-3 transition hover:border-amber-300 hover:bg-white"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-stone-950">
                    {order.number}
                  </span>
                  <StatusBadge>{order.fulfillmentStatus}</StatusBadge>
                </div>
                <p className="mt-1 text-sm text-stone-500">{order.email}</p>
                <p className="mt-2 font-mono text-xs text-stone-600">
                  {formatPrice(order.totalAmount, "USD")}
                </p>
              </Link>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="font-semibold text-stone-950">Stock watch</h2>
          <div className="mt-4 space-y-3">
            {(data?.queues.lowStockVariants ?? []).map((variant) => (
              <Link
                key={variant.id}
                href="/admin/inventory"
                className="flex items-center justify-between rounded-xl border border-stone-200 bg-stone-50 p-3 transition hover:border-amber-300 hover:bg-white"
              >
                <span>
                  <span className="block font-medium text-stone-950">
                    {variant.product.name}
                  </span>
                  <span className="block font-mono text-xs text-stone-500">
                    {variant.sku ?? "NO-SKU"}
                  </span>
                </span>
                <span className="font-mono text-lg font-semibold text-amber-800">
                  {variant.inventoryQuantity}
                </span>
              </Link>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="font-semibold text-stone-950">Draft shelf</h2>
          <div className="mt-4 space-y-3">
            {(data?.queues.draftProducts ?? []).map((product) => (
              <Link
                key={product.id}
                href={`/admin/products/${product.id}`}
                className="block rounded-xl border border-stone-200 bg-stone-50 p-3 font-medium text-stone-950 transition hover:border-amber-300 hover:bg-white"
              >
                {product.name}
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
