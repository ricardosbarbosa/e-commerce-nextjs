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

type ProductColor = {
  id: string;
  slug: string;
  name: string;
  hex: string | null;
  className: string | null;
};

type ProductSize = {
  id: string;
  slug: string;
  name: string;
  sortOrder: number;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function AdminOptionsPage() {
  const queryClient = useQueryClient();
  const { data: colors = [], isLoading: isLoadingColors } = useQuery({
    queryKey: ["admin", "colors"],
    queryFn: () => adminApi<ProductColor[]>("/colors"),
  });
  const { data: sizes = [], isLoading: isLoadingSizes } = useQuery({
    queryKey: ["admin", "sizes"],
    queryFn: () => adminApi<ProductSize[]>("/sizes"),
  });

  const invalidateOptions = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin", "colors"] });
    void queryClient.invalidateQueries({ queryKey: ["admin", "sizes"] });
  };

  const createColor = useMutation({
    mutationFn: (form: FormData) => {
      const name = String(form.get("name") ?? "");

      return adminApi("/colors", {
        method: "POST",
        body: jsonBody({
          name,
          slug: String(form.get("slug") ?? "") || slugify(name),
          hex: String(form.get("hex") ?? "") || null,
          className: String(form.get("className") ?? "") || null,
        }),
      });
    },
    onSuccess: invalidateOptions,
  });

  const updateColor = useMutation({
    mutationFn: ({ id, form }: { id: string; form: FormData }) => {
      const name = String(form.get("name") ?? "");

      return adminApi(`/colors/${id}`, {
        method: "PATCH",
        body: jsonBody({
          name,
          slug: String(form.get("slug") ?? "") || slugify(name),
          hex: String(form.get("hex") ?? "") || null,
          className: String(form.get("className") ?? "") || null,
        }),
      });
    },
    onSuccess: invalidateOptions,
  });

  const deleteColor = useMutation({
    mutationFn: (id: string) =>
      adminApi(`/colors/${id}`, {
        method: "DELETE",
      }),
    onSuccess: invalidateOptions,
  });

  const createSize = useMutation({
    mutationFn: (form: FormData) => {
      const name = String(form.get("name") ?? "");

      return adminApi("/sizes", {
        method: "POST",
        body: jsonBody({
          name,
          slug: String(form.get("slug") ?? "") || slugify(name),
          sortOrder: Number(form.get("sortOrder") ?? 0),
        }),
      });
    },
    onSuccess: invalidateOptions,
  });

  const updateSize = useMutation({
    mutationFn: ({ id, form }: { id: string; form: FormData }) => {
      const name = String(form.get("name") ?? "");

      return adminApi(`/sizes/${id}`, {
        method: "PATCH",
        body: jsonBody({
          name,
          slug: String(form.get("slug") ?? "") || slugify(name),
          sortOrder: Number(form.get("sortOrder") ?? 0),
        }),
      });
    },
    onSuccess: invalidateOptions,
  });

  const deleteSize = useMutation({
    mutationFn: (id: string) =>
      adminApi(`/sizes/${id}`, {
        method: "DELETE",
      }),
    onSuccess: invalidateOptions,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Variant options"
        title="Colors and sizes"
        description="Manage the option values used by product variants, including color chips, SKU labels, and size sort order."
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-semibold text-stone-950">Product colors</h2>
              <p className="mt-1 text-sm text-stone-500">
                Color records power variant filters, swatches, and SKU names.
              </p>
            </div>
            <StatusBadge>{colors.length}</StatusBadge>
          </div>

          <form
            className="mt-5 grid gap-3 rounded-2xl border border-stone-200 bg-stone-50 p-4 md:grid-cols-2"
            action={(formData) => createColor.mutate(formData)}
          >
            <Field label="Name">
              <input name="name" required className={inputClassName} />
            </Field>
            <Field label="Slug">
              <input
                name="slug"
                placeholder="auto from name"
                className={inputClassName}
              />
            </Field>
            <Field label="Hex">
              <input
                name="hex"
                placeholder="#111827"
                className={inputClassName}
              />
            </Field>
            <Field label="Class name">
              <input
                name="className"
                placeholder="bg-stone-950"
                className={inputClassName}
              />
            </Field>
            <div className="md:col-span-2">
              <Button type="submit" disabled={createColor.isPending}>
                Create color
              </Button>
            </div>
          </form>

          <div className="mt-5 space-y-3">
            {colors.map((color) => (
              <form
                key={color.id}
                className="grid gap-3 rounded-2xl border border-stone-200 bg-white p-4 md:grid-cols-[2rem_1fr_1fr_1fr_auto]"
                action={(formData) =>
                  updateColor.mutate({ id: color.id, form: formData })
                }
              >
                <div
                  aria-hidden="true"
                  className="mt-7 h-5 w-5 rounded-full border border-stone-300"
                  style={{ backgroundColor: color.hex ?? "#f5f5f4" }}
                />
                <Field label="Name">
                  <input
                    name="name"
                    defaultValue={color.name}
                    required
                    className={inputClassName}
                  />
                </Field>
                <Field label="Slug">
                  <input
                    name="slug"
                    defaultValue={color.slug}
                    required
                    className={inputClassName}
                  />
                </Field>
                <Field label="Hex">
                  <input
                    name="hex"
                    defaultValue={color.hex ?? ""}
                    className={inputClassName}
                  />
                </Field>
                <div className="flex items-end gap-2">
                  <Button type="submit" disabled={updateColor.isPending}>
                    Save
                  </Button>
                  <SecondaryButton
                    type="button"
                    disabled={deleteColor.isPending}
                    onClick={() => deleteColor.mutate(color.id)}
                  >
                    Delete
                  </SecondaryButton>
                </div>
                <div className="md:col-span-5">
                  <Field label="Class name">
                    <input
                      name="className"
                      defaultValue={color.className ?? ""}
                      className={inputClassName}
                    />
                  </Field>
                </div>
              </form>
            ))}
            {isLoadingColors ? (
              <p className="text-sm text-stone-500">Loading colors...</p>
            ) : null}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-semibold text-stone-950">Product sizes</h2>
              <p className="mt-1 text-sm text-stone-500">
                Sizes are ordered for storefront selectors and variant forms.
              </p>
            </div>
            <StatusBadge>{sizes.length}</StatusBadge>
          </div>

          <form
            className="mt-5 grid gap-3 rounded-2xl border border-stone-200 bg-stone-50 p-4 md:grid-cols-4"
            action={(formData) => createSize.mutate(formData)}
          >
            <div className="md:col-span-2">
              <Field label="Name">
                <input name="name" required className={inputClassName} />
              </Field>
            </div>
            <Field label="Slug">
              <input
                name="slug"
                placeholder="auto from name"
                className={inputClassName}
              />
            </Field>
            <Field label="Sort">
              <input
                name="sortOrder"
                type="number"
                defaultValue={0}
                className={inputClassName}
              />
            </Field>
            <div className="md:col-span-4">
              <Button type="submit" disabled={createSize.isPending}>
                Create size
              </Button>
            </div>
          </form>

          <div className="mt-5 space-y-3">
            {sizes.map((size) => (
              <form
                key={size.id}
                className="grid gap-3 rounded-2xl border border-stone-200 bg-white p-4 md:grid-cols-[1fr_1fr_7rem_auto]"
                action={(formData) =>
                  updateSize.mutate({ id: size.id, form: formData })
                }
              >
                <Field label="Name">
                  <input
                    name="name"
                    defaultValue={size.name}
                    required
                    className={inputClassName}
                  />
                </Field>
                <Field label="Slug">
                  <input
                    name="slug"
                    defaultValue={size.slug}
                    required
                    className={inputClassName}
                  />
                </Field>
                <Field label="Sort">
                  <input
                    name="sortOrder"
                    type="number"
                    defaultValue={size.sortOrder}
                    className={inputClassName}
                  />
                </Field>
                <div className="flex items-end gap-2">
                  <Button type="submit" disabled={updateSize.isPending}>
                    Save
                  </Button>
                  <SecondaryButton
                    type="button"
                    disabled={deleteSize.isPending}
                    onClick={() => deleteSize.mutate(size.id)}
                  >
                    Delete
                  </SecondaryButton>
                </div>
              </form>
            ))}
            {isLoadingSizes ? (
              <p className="text-sm text-stone-500">Loading sizes...</p>
            ) : null}
          </div>
        </Card>
      </div>
    </div>
  );
}
