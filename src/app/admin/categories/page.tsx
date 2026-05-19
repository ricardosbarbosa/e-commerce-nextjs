"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
  parentId: string | null;
  parent?: { name: string } | null;
  _count?: { products: number; children: number };
};

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
          <div className="md:col-span-5">
            <Button type="submit" disabled={createCategory.isPending}>
              Create category
            </Button>
          </div>
        </form>
      </Card>

      <Card className="overflow-hidden">
        <table className="min-w-full divide-y divide-stone-200 text-sm">
          <thead className="bg-stone-50 text-left text-xs uppercase tracking-[0.18em] text-stone-500">
            <tr>
              <th className="px-5 py-3">Category</th>
              <th className="px-5 py-3">Parent</th>
              <th className="px-5 py-3">Products</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {(data?.categories ?? []).map((category) => (
              <tr key={category.id}>
                <td className="px-5 py-4">
                  <div className="font-medium text-stone-950">
                    {category.name}
                  </div>
                  <div className="font-mono text-xs text-stone-500">
                    {category.slug}
                  </div>
                </td>
                <td className="px-5 py-4 text-stone-600">
                  {category.parent?.name ?? "Root"}
                </td>
                <td className="px-5 py-4">
                  <StatusBadge>{category._count?.products ?? 0}</StatusBadge>
                </td>
                <td className="px-5 py-4 text-right">
                  <SecondaryButton
                    type="button"
                    onClick={() => deleteCategory.mutate(category.id)}
                  >
                    Delete
                  </SecondaryButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {isLoading ? (
          <p className="p-5 text-sm text-stone-500">Loading categories...</p>
        ) : null}
      </Card>
    </div>
  );
}
