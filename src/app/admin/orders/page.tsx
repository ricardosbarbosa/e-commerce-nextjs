"use client";

import { formatPrice } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { adminApi } from "../_components/admin-api";
import { Card, PageHeader, StatusBadge } from "../_components/ui";

type Order = {
  id: string;
  number: string;
  email: string;
  status: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  totalAmount: number;
  currency: string;
  placedAt: string;
};

export default function AdminOrdersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: () =>
      adminApi<{ orders: Order[]; total: number }>("/orders?limit=100"),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Order desk"
        title="Orders"
        description="Review customer orders, payment state, and fulfillment status across the store."
      />

      <Card className="overflow-hidden">
        <table className="min-w-full divide-y divide-stone-200 text-sm">
          <thead className="bg-stone-50 text-left text-xs uppercase tracking-[0.18em] text-stone-500">
            <tr>
              <th className="px-5 py-3">Order</th>
              <th className="px-5 py-3">Customer</th>
              <th className="px-5 py-3">Payment</th>
              <th className="px-5 py-3">Fulfillment</th>
              <th className="px-5 py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {(data?.orders ?? []).map((order) => (
              <tr key={order.id}>
                <td className="px-5 py-4">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="font-medium text-stone-950 hover:underline"
                  >
                    {order.number}
                  </Link>
                  <div className="text-xs text-stone-500">
                    {new Date(order.placedAt).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-5 py-4 text-stone-600">{order.email}</td>
                <td className="px-5 py-4">
                  <StatusBadge>{order.paymentStatus}</StatusBadge>
                </td>
                <td className="px-5 py-4">
                  <StatusBadge>{order.fulfillmentStatus}</StatusBadge>
                </td>
                <td className="px-5 py-4 text-right font-mono">
                  {formatPrice(order.totalAmount, order.currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {isLoading ? (
          <p className="p-5 text-sm text-stone-500">Loading orders...</p>
        ) : null}
      </Card>
    </div>
  );
}
