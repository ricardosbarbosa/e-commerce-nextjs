"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { adminApi, jsonBody } from "../_components/admin-api";
import {
  Card,
  PageHeader,
  SecondaryButton,
  StatusBadge,
  inputClassName,
} from "../_components/ui";

type Product = {
  id: string;
  name: string;
  variants: {
    id: string;
    sku: string | null;
    inventoryQuantity: number;
    color?: { name: string } | null;
    size?: { name: string } | null;
  }[];
};

export default function AdminInventoryPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "inventory"],
    queryFn: () => adminApi<{ products: Product[] }>("/products?limit=100"),
  });

  const updateInventory = useMutation({
    mutationFn: ({
      id,
      inventoryQuantity,
    }: {
      id: string;
      inventoryQuantity: number;
    }) =>
      adminApi(`/variants/${id}/inventory`, {
        method: "PATCH",
        body: jsonBody({ inventoryQuantity }),
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin", "inventory"] }),
  });

  const rows =
    data?.products.flatMap((product) =>
      product.variants.map((variant) => ({ ...variant, product })),
    ) ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Stockroom"
        title="Inventory"
        description="Adjust on-hand quantities for every SKU without opening each product file."
      />

      <Card className="overflow-hidden">
        <table className="min-w-full divide-y divide-stone-200 text-sm">
          <thead className="bg-stone-50 text-left text-xs uppercase tracking-[0.18em] text-stone-500">
            <tr>
              <th className="px-5 py-3">SKU</th>
              <th className="px-5 py-3">Product</th>
              <th className="px-5 py-3">Variant</th>
              <th className="px-5 py-3">Stock</th>
              <th className="px-5 py-3 text-right">Save</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="px-5 py-4 font-mono text-xs text-stone-600">
                  {row.sku ?? "NO-SKU"}
                </td>
                <td className="px-5 py-4">
                  <Link
                    href={`/admin/products/${row.product.id}`}
                    className="font-medium text-stone-950 hover:underline"
                  >
                    {row.product.name}
                  </Link>
                </td>
                <td className="px-5 py-4 text-stone-600">
                  {row.color?.name ?? "Any color"} /{" "}
                  {row.size?.name ?? "Any size"}
                </td>
                <td className="px-5 py-4">
                  <input
                    id={`inventory-${row.id}`}
                    type="number"
                    min={0}
                    defaultValue={row.inventoryQuantity}
                    className={inputClassName}
                  />
                </td>
                <td className="px-5 py-4 text-right">
                  <div className="flex items-center justify-end gap-3">
                    {row.inventoryQuantity <= 5 ? (
                      <StatusBadge>Low</StatusBadge>
                    ) : null}
                    <SecondaryButton
                      type="button"
                      onClick={() => {
                        const input = document.getElementById(
                          `inventory-${row.id}`,
                        ) as HTMLInputElement | null;
                        updateInventory.mutate({
                          id: row.id,
                          inventoryQuantity: Number(input?.value ?? 0),
                        });
                      }}
                    >
                      Save
                    </SecondaryButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {isLoading ? (
          <p className="p-5 text-sm text-stone-500">Loading inventory...</p>
        ) : null}
      </Card>
    </div>
  );
}
