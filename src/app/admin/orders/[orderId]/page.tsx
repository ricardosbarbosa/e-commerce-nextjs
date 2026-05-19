"use client";

import { formatPrice } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { adminApi, jsonBody } from "../../_components/admin-api";
import {
  Button,
  Card,
  Field,
  PageHeader,
  StatusBadge,
  inputClassName,
} from "../../_components/ui";

type Order = {
  id: string;
  number: string;
  email: string;
  status: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  currency: string;
  subtotalAmount: number;
  shippingAmount: number;
  taxAmount: number;
  totalAmount: number;
  placedAt: string;
  shippingAddress: {
    name: string;
    line1: string;
    city: string;
    region: string | null;
    postalCode: string;
    country: string;
  } | null;
  items: {
    id: string;
    productName: string;
    variantName: string | null;
    sku: string | null;
    quantity: number;
    unitPrice: number;
    fulfillmentStatus: string;
  }[];
};

const orderStatuses = ["PENDING", "CONFIRMED", "CANCELLED", "REFUNDED"];
const paymentStatuses = ["PENDING", "AUTHORIZED", "PAID", "FAILED", "REFUNDED"];
const fulfillmentStatuses = [
  "NOT_FULFILLED",
  "PROCESSING",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];

export default function AdminOrderDetailPage() {
  const params = useParams<{ orderId: string }>();
  const queryClient = useQueryClient();
  const orderId = params.orderId;
  const { data } = useQuery({
    queryKey: ["admin", "order", orderId],
    queryFn: () => adminApi<{ order: Order }>(`/orders/${orderId}`),
  });

  const order = data?.order;

  const updateOrder = useMutation({
    mutationFn: (form: FormData) =>
      adminApi(`/orders/${orderId}`, {
        method: "PATCH",
        body: jsonBody({
          status: String(form.get("status") ?? ""),
          paymentStatus: String(form.get("paymentStatus") ?? ""),
          fulfillmentStatus: String(form.get("fulfillmentStatus") ?? ""),
        }),
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin", "order", orderId] }),
  });

  const updateItem = useMutation({
    mutationFn: ({
      itemId,
      fulfillmentStatus,
    }: {
      itemId: string;
      fulfillmentStatus: string;
    }) =>
      adminApi(`/orders/${orderId}/items/${itemId}`, {
        method: "PATCH",
        body: jsonBody({ fulfillmentStatus }),
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin", "order", orderId] }),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Pick ticket"
        title={order?.number ?? "Order"}
        description="Update order state, payment state, fulfillment progress, and line-level handling."
      />

      {order ? (
        <>
          <Card className="p-5">
            <form
              className="grid gap-4 md:grid-cols-4"
              action={(formData) => updateOrder.mutate(formData)}
            >
              <Field label="Order status">
                <select
                  name="status"
                  defaultValue={order.status}
                  className={inputClassName}
                >
                  {orderStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Payment">
                <select
                  name="paymentStatus"
                  defaultValue={order.paymentStatus}
                  className={inputClassName}
                >
                  {paymentStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Fulfillment">
                <select
                  name="fulfillmentStatus"
                  defaultValue={order.fulfillmentStatus}
                  className={inputClassName}
                >
                  {fulfillmentStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </Field>
              <div className="flex items-end">
                <Button type="submit" disabled={updateOrder.isPending}>
                  Save order
                </Button>
              </div>
            </form>
          </Card>

          <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
            <Card className="overflow-hidden">
              <table className="min-w-full divide-y divide-stone-200 text-sm">
                <thead className="bg-stone-50 text-left text-xs uppercase tracking-[0.18em] text-stone-500">
                  <tr>
                    <th className="px-5 py-3">Item</th>
                    <th className="px-5 py-3">Quantity</th>
                    <th className="px-5 py-3">Fulfillment</th>
                    <th className="px-5 py-3 text-right">Unit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-5 py-4">
                        <div className="font-medium text-stone-950">
                          {item.productName}
                        </div>
                        <div className="font-mono text-xs text-stone-500">
                          {item.sku ?? "NO-SKU"} · {item.variantName}
                        </div>
                      </td>
                      <td className="px-5 py-4 font-mono">{item.quantity}</td>
                      <td className="px-5 py-4">
                        <select
                          value={item.fulfillmentStatus}
                          className={inputClassName}
                          onChange={(event) =>
                            updateItem.mutate({
                              itemId: item.id,
                              fulfillmentStatus: event.target.value,
                            })
                          }
                        >
                          {fulfillmentStatuses.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-5 py-4 text-right font-mono">
                        {formatPrice(item.unitPrice, order.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>

            <Card className="p-5">
              <h2 className="font-semibold text-stone-950">Summary</h2>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-stone-500">Subtotal</dt>
                  <dd>{formatPrice(order.subtotalAmount, order.currency)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-stone-500">Shipping</dt>
                  <dd>{formatPrice(order.shippingAmount, order.currency)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-stone-500">Tax</dt>
                  <dd>{formatPrice(order.taxAmount, order.currency)}</dd>
                </div>
                <div className="flex justify-between border-t border-stone-200 pt-2 font-semibold">
                  <dt>Total</dt>
                  <dd>{formatPrice(order.totalAmount, order.currency)}</dd>
                </div>
              </dl>
              <div className="mt-5">
                <StatusBadge>{order.email}</StatusBadge>
              </div>
              {order.shippingAddress ? (
                <address className="mt-5 text-sm not-italic text-stone-600">
                  <span className="block font-medium text-stone-950">
                    {order.shippingAddress.name}
                  </span>
                  <span className="block">{order.shippingAddress.line1}</span>
                  <span className="block">
                    {order.shippingAddress.city}, {order.shippingAddress.region}{" "}
                    {order.shippingAddress.postalCode}
                  </span>
                  <span className="block">{order.shippingAddress.country}</span>
                </address>
              ) : null}
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
}
