"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ProductImageUpload } from "../_components/ProductImageUpload";
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

type Category = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  imageSrc: string | null;
  imageAlt: string | null;
  parentId: string | null;
  parent?: { name: string } | null;
  _count?: { products: number; children: number };
};

function CategoryImageField({
  value,
  fieldName,
}: {
  value?: string | null;
  fieldName: string;
}) {
  const [imageUrl, setImageUrl] = useState(value ?? "");

  return (
    <div className="space-y-3">
      <ProductImageUpload
        uploadPath="/api/admin/uploads/category-images"
        onUploaded={setImageUrl}
      />
      <Field label="Image URL">
        <input
          name={fieldName}
          value={imageUrl}
          onChange={(event) => setImageUrl(event.target.value)}
          placeholder="https://..."
          className={inputClassName}
        />
      </Field>
      {imageUrl ? (
        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-stone-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt="" className="h-36 w-full object-cover" />
        </div>
      ) : null}
    </div>
  );
}

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: () => adminApi<{ categories: Category[] }>("/categories"),
  });

  const createCategory = useMutation({
    mutationFn: (form: FormData) =>
      adminApi("/categories", {
        method: "POST",
        body: jsonBody({
          name: String(form.get("name") ?? ""),
          slug: String(form.get("slug") ?? ""),
          description: String(form.get("description") ?? "") || null,
          imageSrc: String(form.get("imageSrc") ?? "") || null,
          imageAlt: String(form.get("imageAlt") ?? "") || null,
          parentId: String(form.get("parentId") ?? "") || null,
        }),
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] }),
  });

  const updateCategory = useMutation({
    mutationFn: ({ id, form }: { id: string; form: FormData }) =>
      adminApi(`/categories/${id}`, {
        method: "PATCH",
        body: jsonBody({
          name: String(form.get("name") ?? ""),
          slug: String(form.get("slug") ?? ""),
          description: String(form.get("description") ?? "") || null,
          imageSrc: String(form.get("imageSrc") ?? "") || null,
          imageAlt: String(form.get("imageAlt") ?? "") || null,
          parentId: String(form.get("parentId") ?? "") || null,
        }),
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] }),
  });

  const deleteCategory = useMutation({
    mutationFn: (id: string) =>
      adminApi(`/categories/${id}`, { method: "DELETE" }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] }),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Aisles"
        title="Categories"
        description="Manage product taxonomy, parent categories, and merchandising groupings."
      />

      <Card className="p-5">
        <form
          className="grid gap-4 md:grid-cols-5"
          action={(formData) => createCategory.mutate(formData)}
        >
          <Field label="Name">
            <input name="name" required className={inputClassName} />
          </Field>
          <Field label="Slug">
            <input name="slug" required className={inputClassName} />
          </Field>
          <Field label="Parent">
            <select name="parentId" className={inputClassName} defaultValue="">
              <option value="">No parent</option>
              {(data?.categories ?? []).map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </Field>
          <div className="md:col-span-2">
            <Field label="Description">
              <input name="description" className={inputClassName} />
            </Field>
          </div>
          <div className="md:col-span-3">
            <CategoryImageField fieldName="imageSrc" />
          </div>
          <div className="md:col-span-2">
            <Field label="Image alt text">
              <input name="imageAlt" className={inputClassName} />
            </Field>
          </div>
          <div className="md:col-span-5">
            <Button type="submit" disabled={createCategory.isPending}>
              Create category
            </Button>
          </div>
        </form>
      </Card>

      <Card className="p-5">
        <div className="space-y-4">
          {(data?.categories ?? []).map((category) => (
            <form
              key={category.id}
              className="grid gap-4 rounded-2xl border border-stone-200 bg-white p-4 md:grid-cols-6"
              action={(formData) =>
                updateCategory.mutate({ id: category.id, form: formData })
              }
            >
              <div className="md:col-span-2">
                <Field label="Name">
                  <input
                    name="name"
                    defaultValue={category.name}
                    required
                    className={inputClassName}
                  />
                </Field>
              </div>
              <div className="md:col-span-2">
                <Field label="Slug">
                  <input
                    name="slug"
                    defaultValue={category.slug}
                    required
                    className={inputClassName}
                  />
                </Field>
              </div>
              <Field label="Parent">
                <select
                  name="parentId"
                  className={inputClassName}
                  defaultValue={category.parentId ?? ""}
                >
                  <option value="">No parent</option>
                  {(data?.categories ?? [])
                    .filter((item) => item.id !== category.id)
                    .map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                </select>
              </Field>
              <div className="flex items-end">
                <StatusBadge>
                  {category._count?.products ?? 0} products
                </StatusBadge>
              </div>
              <div className="md:col-span-3">
                <Field label="Description">
                  <input
                    name="description"
                    defaultValue={category.description ?? ""}
                    className={inputClassName}
                  />
                </Field>
              </div>
              <div className="md:col-span-3">
                <Field label="Image alt text">
                  <input
                    name="imageAlt"
                    defaultValue={category.imageAlt ?? ""}
                    className={inputClassName}
                  />
                </Field>
              </div>
              <div className="md:col-span-6">
                <CategoryImageField
                  fieldName="imageSrc"
                  value={category.imageSrc}
                />
              </div>
              <div className="flex gap-2 md:col-span-6">
                <Button type="submit" disabled={updateCategory.isPending}>
                  Save category
                </Button>
                <SecondaryButton
                  type="button"
                  onClick={() => deleteCategory.mutate(category.id)}
                >
                  Delete
                </SecondaryButton>
              </div>
            </form>
          ))}
        </div>
        {isLoading ? (
          <p className="p-5 text-sm text-stone-500">Loading categories...</p>
        ) : null}
      </Card>
    </div>
  );
}
