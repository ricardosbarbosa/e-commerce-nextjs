"use client";

import { formatPrice } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { adminApi, jsonBody } from "../_components/admin-api";
import {
  Button,
  Card,
  Field,
  PageHeader,
  SecondaryButton,
  StatusBadge,
  inputClassName,
} from "../_components/ui";

type Product = {
  id: string;
  name: string;
  slug: string;
  status: string;
  price: number;
  currency: string;
  variants: { id: string; inventoryQuantity: number }[];
};

type ProductsResponse = {
  products: Product[];
  total: number;
};

export default function AdminProductsPage() {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "products"],
    queryFn: () => adminApi<ProductsResponse>("/products?limit=100"),
  });

  const createProduct = useMutation({
    mutationFn: (form: FormData) =>
      adminApi("/products", {
        method: "POST",
        body: jsonBody({
          name: String(form.get("name") ?? ""),
          slug: String(form.get("slug") ?? ""),
          price: String(form.get("price") ?? "0"),
          status: String(form.get("status") ?? "DRAFT"),
          description: String(form.get("description") ?? ""),
          details: [],
          images: [],
        }),
      }),
    onSuccess: () => {
      setCreateOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    },
  });

  const deleteProduct = useMutation({
    mutationFn: (id: string) =>
      adminApi(`/products/${id}`, { method: "DELETE" }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] }),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Merchandising board"
        title="Products"
        description="Create, edit, publish, archive, and remove catalog products and their variants. Only ACTIVE products are visible in the storefront and can be added to cart."
        action={
          <Button
            type="button"
            onClick={() => setCreateOpen((value) => !value)}
          >
            New product
          </Button>
        }
      />

      {createOpen ? (
        <Card className="p-5">
          <form
            className="grid gap-4 md:grid-cols-5"
            action={(formData) => createProduct.mutate(formData)}
          >
            <Field label="Name">
              <input name="name" required className={inputClassName} />
            </Field>
            <Field label="Slug">
              <input name="slug" required className={inputClassName} />
            </Field>
            <Field label="Price">
              <input
                name="price"
                required
                defaultValue="0.00"
                className={inputClassName}
              />
            </Field>
            <Field label="Status">
              <select name="status" className={inputClassName}>
                <option value="DRAFT">Draft - hidden from storefront</option>
                <option value="ACTIVE">Active - sellable</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </Field>
            <div className="flex items-end">
              <Button type="submit" disabled={createProduct.isPending}>
                Create
              </Button>
            </div>
            <div className="md:col-span-5">
              <Field label="Description">
                <textarea
                  name="description"
                  rows={3}
                  className={inputClassName}
                />
              </Field>
            </div>
          </form>
        </Card>
      ) : null}

      <Card className="overflow-hidden">
        <table className="min-w-full divide-y divide-stone-200 text-sm">
          <thead className="bg-stone-50">
            <tr className="text-left text-xs uppercase tracking-[0.18em] text-stone-500">
              <th className="px-5 py-3">Product</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Stock</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {(data?.products ?? []).map((product) => (
              <tr key={product.id}>
                <td className="px-5 py-4">
                  <Link
                    href={`/admin/products/${product.id}`}
                    className="font-medium text-stone-950 hover:underline"
                  >
                    {product.name}
                  </Link>
                  <div className="font-mono text-xs text-stone-500">
                    {product.slug} ·{" "}
                    {formatPrice(product.price, product.currency)}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <StatusBadge>{product.status}</StatusBadge>
                </td>
                <td className="px-5 py-4 font-mono">
                  {product.variants.reduce(
                    (sum, variant) => sum + variant.inventoryQuantity,
                    0,
                  )}
                </td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/products/${product.id}`}>
                      <SecondaryButton type="button">Edit</SecondaryButton>
                    </Link>
                    <SecondaryButton
                      type="button"
                      onClick={() => deleteProduct.mutate(product.id)}
                    >
                      Delete
                    </SecondaryButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {isLoading ? (
          <p className="p-5 text-sm text-stone-500">Loading products...</p>
        ) : null}
      </Card>
    </div>
  );
}
