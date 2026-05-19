"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useState } from "react";
import { ProductImageUpload } from "../../_components/ProductImageUpload";
import { adminApi, jsonBody } from "../../_components/admin-api";
import {
  Button,
  Card,
  Field,
  PageHeader,
  SecondaryButton,
  StatusBadge,
  inputClassName,
} from "../../_components/ui";

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: string;
  price: number;
  compareAtPrice: number | null;
  currency: string;
  isFeatured: boolean;
  details: string[];
  categories: { id: string; name: string }[];
  images: { id: string; imageSrc: string; imageAlt: string | null }[];
  variants: Variant[];
};

type Variant = {
  id: string;
  sku: string | null;
  name: string | null;
  price: number | null;
  inventoryQuantity: number;
  leadTime: string | null;
  colorId: string | null;
  sizeId: string | null;
  color?: { name: string } | null;
  size?: { name: string } | null;
};

type Category = { id: string; name: string };
type Color = { id: string; name: string };
type Size = { id: string; name: string };

export default function AdminProductDetailPage() {
  const params = useParams<{ productId: string }>();
  const productId = params.productId;
  const queryClient = useQueryClient();
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const { data } = useQuery({
    queryKey: ["admin", "product", productId],
    queryFn: () =>
      adminApi<{ product: Product }>(`/products/${productId}`).then(
        (result) => {
          setImageUrls(result.product.images.map((image) => image.imageSrc));
          return result;
        },
      ),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: () => adminApi<{ categories: Category[] }>("/categories"),
  });

  const { data: colorsData } = useQuery({
    queryKey: ["admin", "colors"],
    queryFn: () => adminApi<Color[]>("/colors"),
  });

  const { data: sizesData } = useQuery({
    queryKey: ["admin", "sizes"],
    queryFn: () => adminApi<Size[]>("/sizes"),
  });

  const product = data?.product;

  const updateProduct = useMutation({
    mutationFn: (form: FormData) =>
      adminApi(`/products/${productId}`, {
        method: "PATCH",
        body: jsonBody({
          name: String(form.get("name") ?? ""),
          slug: String(form.get("slug") ?? ""),
          price: String(form.get("price") ?? "0"),
          compareAtPrice: String(form.get("compareAtPrice") ?? "") || null,
          currency: String(form.get("currency") ?? "USD"),
          status: String(form.get("status") ?? "DRAFT"),
          description: String(form.get("description") ?? ""),
          isFeatured: form.get("isFeatured") === "on",
          details: String(form.get("details") ?? "")
            .split("\n")
            .map((item) => item.trim())
            .filter(Boolean),
          categoryIds: form.getAll("categoryIds").map(String),
          images: imageUrls.map((imageSrc, index) => ({
            imageSrc,
            isPrimary: index === 0,
            sortOrder: index,
          })),
        }),
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["admin", "product", productId],
      }),
  });

  const createVariant = useMutation({
    mutationFn: (form: FormData) =>
      adminApi(`/products/${productId}/variants`, {
        method: "POST",
        body: jsonBody({
          sku: String(form.get("sku") ?? "") || null,
          name: String(form.get("name") ?? "") || null,
          price: String(form.get("price") ?? "") || null,
          inventoryQuantity: Number(form.get("inventoryQuantity") ?? 0),
          colorId: String(form.get("colorId") ?? "") || null,
          sizeId: String(form.get("sizeId") ?? "") || null,
          leadTime: String(form.get("leadTime") ?? "") || null,
        }),
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["admin", "product", productId],
      }),
  });

  const deleteVariant = useMutation({
    mutationFn: (variantId: string) =>
      adminApi(`/variants/${variantId}`, { method: "DELETE" }),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["admin", "product", productId],
      }),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Product file"
        title={product?.name ?? "Product"}
        description="Edit merchandising details, publish state, product images, and SKU-level variants."
      />

      {product ? (
        <Card className="p-5">
          <form
            key={product.id}
            className="grid gap-4 md:grid-cols-4"
            action={(formData) => updateProduct.mutate(formData)}
          >
            <Field label="Name">
              <input
                name="name"
                defaultValue={product.name}
                className={inputClassName}
              />
            </Field>
            <Field label="Slug">
              <input
                name="slug"
                defaultValue={product.slug}
                className={inputClassName}
              />
            </Field>
            <Field label="Price">
              <input
                name="price"
                defaultValue={product.price.toFixed(2)}
                className={inputClassName}
              />
            </Field>
            <Field label="Compare at">
              <input
                name="compareAtPrice"
                defaultValue={product.compareAtPrice?.toFixed(2) ?? ""}
                className={inputClassName}
              />
            </Field>
            <Field label="Currency">
              <input
                name="currency"
                defaultValue={product.currency}
                className={inputClassName}
              />
            </Field>
            <Field label="Status">
              <select
                name="status"
                defaultValue={product.status}
                className={inputClassName}
              >
                <option value="DRAFT">Draft</option>
                <option value="ACTIVE">Active</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </Field>
            <Field label="Featured">
              <input
                name="isFeatured"
                type="checkbox"
                defaultChecked={product.isFeatured}
                className="h-5 w-5 rounded border-stone-300 text-stone-950"
              />
            </Field>
            <div className="md:col-span-4">
              <Field label="Description">
                <textarea
                  name="description"
                  defaultValue={product.description ?? ""}
                  rows={4}
                  className={inputClassName}
                />
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field label="Details, one per line">
                <textarea
                  name="details"
                  defaultValue={product.details.join("\n")}
                  rows={5}
                  className={inputClassName}
                />
              </Field>
            </div>
            <div className="md:col-span-2">
              <p className="mb-1 text-sm font-medium text-stone-700">
                Categories
              </p>
              <div className="grid max-h-40 gap-2 overflow-auto rounded-xl border border-stone-200 bg-stone-50 p-3">
                {(categoriesData?.categories ?? []).map((category) => (
                  <label
                    key={category.id}
                    className="flex items-center gap-2 text-sm text-stone-700"
                  >
                    <input
                      name="categoryIds"
                      type="checkbox"
                      value={category.id}
                      defaultChecked={product.categories.some(
                        (item) => item.id === category.id,
                      )}
                    />
                    {category.name}
                  </label>
                ))}
              </div>
            </div>
            <div className="md:col-span-4">
              <ProductImageUpload
                onUploaded={(url) =>
                  setImageUrls((current) => [...current, url])
                }
              />
              <div className="mt-3 grid gap-2 md:grid-cols-3">
                {imageUrls.map((url, index) => (
                  <div
                    key={url}
                    className="rounded-xl border border-stone-200 bg-stone-50 p-3"
                  >
                    <p className="truncate font-mono text-xs text-stone-500">
                      {url}
                    </p>
                    <SecondaryButton
                      type="button"
                      className="mt-2"
                      onClick={() =>
                        setImageUrls((current) =>
                          current.filter((item) => item !== url),
                        )
                      }
                    >
                      Remove {index === 0 ? "primary" : "image"}
                    </SecondaryButton>
                  </div>
                ))}
              </div>
            </div>
            <div className="md:col-span-4">
              <Button type="submit" disabled={updateProduct.isPending}>
                Save product
              </Button>
            </div>
          </form>
        </Card>
      ) : null}

      <Card className="p-5">
        <h2 className="font-semibold text-stone-950">Variants</h2>
        <div className="mt-4 divide-y divide-stone-100">
          {(product?.variants ?? []).map((variant) => (
            <div
              key={variant.id}
              className="flex items-center justify-between gap-4 py-3"
            >
              <div>
                <p className="font-medium text-stone-950">
                  {variant.color?.name ?? "Any color"} /{" "}
                  {variant.size?.name ?? "Any size"}
                </p>
                <p className="font-mono text-xs text-stone-500">
                  {variant.sku ?? "NO-SKU"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge>{variant.inventoryQuantity} in stock</StatusBadge>
                <SecondaryButton
                  type="button"
                  onClick={() => deleteVariant.mutate(variant.id)}
                >
                  Delete
                </SecondaryButton>
              </div>
            </div>
          ))}
        </div>
        <form
          className="mt-5 grid gap-3 rounded-2xl border border-stone-200 bg-stone-50 p-4 md:grid-cols-6"
          action={(formData) => createVariant.mutate(formData)}
        >
          <input name="sku" placeholder="SKU" className={inputClassName} />
          <input name="name" placeholder="Name" className={inputClassName} />
          <input
            name="price"
            placeholder="Price override"
            className={inputClassName}
          />
          <input
            name="inventoryQuantity"
            type="number"
            placeholder="Stock"
            className={inputClassName}
          />
          <select name="colorId" className={inputClassName} defaultValue="">
            <option value="">Color</option>
            {(colorsData ?? []).map((color) => (
              <option key={color.id} value={color.id}>
                {color.name}
              </option>
            ))}
          </select>
          <select name="sizeId" className={inputClassName} defaultValue="">
            <option value="">Size</option>
            {(sizesData ?? []).map((size) => (
              <option key={size.id} value={size.id}>
                {size.name}
              </option>
            ))}
          </select>
          <div className="md:col-span-6">
            <Button type="submit" disabled={createVariant.isPending}>
              Add variant
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
