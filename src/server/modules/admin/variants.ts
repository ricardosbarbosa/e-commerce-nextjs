import { adminPlugin } from "@/server/plugins/admin";
import { prismaPlugin } from "@/server/plugins/prisma";
import { Elysia } from "elysia";
import * as z from "zod";
import {
  idParamsSchema,
  moneyStringSchema,
  productImageInputSchema,
} from "./shared";

const productParamsSchema = z.object({
  productId: z.string().min(1),
});

const variantBodySchema = z.object({
  colorId: z.string().optional().nullable(),
  sizeId: z.string().optional().nullable(),
  sku: z.string().trim().optional().nullable(),
  name: z.string().trim().optional().nullable(),
  price: moneyStringSchema.optional().nullable(),
  inventoryQuantity: z.number().int().min(0).optional(),
  leadTime: z.string().trim().optional().nullable(),
  images: z.array(productImageInputSchema).optional(),
});

const inventoryBodySchema = z.object({
  inventoryQuantity: z.number().int().min(0),
});

const colorBodySchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  hex: z.string().optional().nullable(),
  className: z.string().optional().nullable(),
});

const sizeBodySchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  sortOrder: z.number().int().optional(),
});

function serializeVariant<
  T extends {
    price: unknown;
    createdAt: Date;
    updatedAt: Date;
    images?: { createdAt: Date; updatedAt: Date }[];
  },
>(variant: T) {
  return {
    ...variant,
    price: variant.price ? Number(variant.price) : null,
    createdAt: variant.createdAt.toISOString(),
    updatedAt: variant.updatedAt.toISOString(),
    images: variant.images?.map((image) => ({
      ...image,
      createdAt: image.createdAt.toISOString(),
      updatedAt: image.updatedAt.toISOString(),
    })),
  };
}

export const adminVariantsModule = new Elysia({
  name: "admin-variants",
})
  .use(prismaPlugin)
  .use(adminPlugin)
  .get(
    "/products/:productId/variants",
    async ({ prisma, params }) => {
      const variants = await prisma.productVariant.findMany({
        where: { productId: params.productId },
        include: {
          color: true,
          size: true,
          images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }] },
        },
        orderBy: { createdAt: "asc" },
      });

      return { variants: variants.map(serializeVariant) };
    },
    {
      admin: true,
      params: productParamsSchema,
      detail: {
        summary: "List product variants",
        tags: ["Admin", "Variants"],
      },
    },
  )
  .post(
    "/products/:productId/variants",
    async ({ prisma, params, body }) => {
      const variant = await prisma.$transaction(async (tx) => {
        const created = await tx.productVariant.create({
          data: {
            productId: params.productId,
            colorId: body.colorId ?? null,
            sizeId: body.sizeId ?? null,
            sku: body.sku ?? null,
            name: body.name ?? null,
            price: body.price ?? null,
            inventoryQuantity: body.inventoryQuantity ?? 0,
            leadTime: body.leadTime ?? null,
          },
        });

        if (body.images?.length) {
          await tx.productImage.createMany({
            data: body.images.map((image, index) => ({
              productId: params.productId,
              variantId: created.id,
              imageSrc: image.imageSrc,
              imageAlt: image.imageAlt ?? null,
              isPrimary: image.isPrimary ?? index === 0,
              sortOrder: image.sortOrder ?? index,
            })),
          });
        }

        return tx.productVariant.findUniqueOrThrow({
          where: { id: created.id },
          include: {
            color: true,
            size: true,
            images: {
              orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
            },
          },
        });
      });

      return { variant: serializeVariant(variant) };
    },
    {
      admin: true,
      params: productParamsSchema,
      body: variantBodySchema,
      detail: {
        summary: "Create a product variant",
        tags: ["Admin", "Variants"],
      },
    },
  )
  .patch(
    "/variants/:id",
    async ({ prisma, params, body, status }) => {
      const existing = await prisma.productVariant.findUnique({
        where: { id: params.id },
        select: { id: true, productId: true },
      });

      if (!existing) {
        return status(404, { error: "Variant not found." });
      }

      const variant = await prisma.$transaction(async (tx) => {
        await tx.productVariant.update({
          where: { id: params.id },
          data: {
            ...(body.colorId !== undefined ? { colorId: body.colorId } : {}),
            ...(body.sizeId !== undefined ? { sizeId: body.sizeId } : {}),
            ...(body.sku !== undefined ? { sku: body.sku } : {}),
            ...(body.name !== undefined ? { name: body.name } : {}),
            ...(body.price !== undefined ? { price: body.price } : {}),
            ...(body.inventoryQuantity !== undefined
              ? { inventoryQuantity: body.inventoryQuantity }
              : {}),
            ...(body.leadTime !== undefined ? { leadTime: body.leadTime } : {}),
          },
        });

        if (body.images) {
          await tx.productImage.deleteMany({
            where: { variantId: params.id },
          });
          if (body.images.length) {
            await tx.productImage.createMany({
              data: body.images.map((image, index) => ({
                productId: existing.productId,
                variantId: params.id,
                imageSrc: image.imageSrc,
                imageAlt: image.imageAlt ?? null,
                isPrimary: image.isPrimary ?? index === 0,
                sortOrder: image.sortOrder ?? index,
              })),
            });
          }
        }

        return tx.productVariant.findUniqueOrThrow({
          where: { id: params.id },
          include: {
            color: true,
            size: true,
            images: {
              orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
            },
          },
        });
      });

      return { variant: serializeVariant(variant) };
    },
    {
      admin: true,
      params: idParamsSchema,
      body: variantBodySchema.partial(),
      detail: {
        summary: "Update a variant",
        tags: ["Admin", "Variants"],
      },
    },
  )
  .patch(
    "/variants/:id/inventory",
    async ({ prisma, params, body, status }) => {
      const variant = await prisma.productVariant
        .update({
          where: { id: params.id },
          data: { inventoryQuantity: body.inventoryQuantity },
          include: { color: true, size: true },
        })
        .catch(() => null);

      if (!variant) {
        return status(404, { error: "Variant not found." });
      }

      return { variant: serializeVariant(variant) };
    },
    {
      admin: true,
      params: idParamsSchema,
      body: inventoryBodySchema,
      detail: {
        summary: "Update variant inventory",
        tags: ["Admin", "Inventory"],
      },
    },
  )
  .delete(
    "/variants/:id",
    async ({ prisma, params, status }) => {
      const variant = await prisma.productVariant
        .delete({ where: { id: params.id } })
        .catch(() => null);

      if (!variant) {
        return status(404, { error: "Variant not found." });
      }

      return { ok: true };
    },
    {
      admin: true,
      params: idParamsSchema,
      detail: {
        summary: "Delete a variant",
        tags: ["Admin", "Variants"],
      },
    },
  )
  .get(
    "/colors",
    ({ prisma }) => prisma.productColor.findMany({ orderBy: { name: "asc" } }),
    {
      admin: true,
      detail: { summary: "List colors", tags: ["Admin", "Variants"] },
    },
  )
  .post(
    "/colors",
    ({ prisma, body }) => prisma.productColor.create({ data: body }),
    {
      admin: true,
      body: colorBodySchema,
      detail: { summary: "Create a color", tags: ["Admin", "Variants"] },
    },
  )
  .patch(
    "/colors/:id",
    ({ prisma, params, body }) =>
      prisma.productColor.update({ where: { id: params.id }, data: body }),
    {
      admin: true,
      params: idParamsSchema,
      body: colorBodySchema.partial(),
      detail: { summary: "Update a color", tags: ["Admin", "Variants"] },
    },
  )
  .delete(
    "/colors/:id",
    ({ prisma, params }) =>
      prisma.productColor.delete({ where: { id: params.id } }).then(() => ({
        ok: true,
      })),
    {
      admin: true,
      params: idParamsSchema,
      detail: { summary: "Delete a color", tags: ["Admin", "Variants"] },
    },
  )
  .get(
    "/sizes",
    ({ prisma }) =>
      prisma.productSize.findMany({ orderBy: { sortOrder: "asc" } }),
    {
      admin: true,
      detail: { summary: "List sizes", tags: ["Admin", "Variants"] },
    },
  )
  .post(
    "/sizes",
    ({ prisma, body }) => prisma.productSize.create({ data: body }),
    {
      admin: true,
      body: sizeBodySchema,
      detail: { summary: "Create a size", tags: ["Admin", "Variants"] },
    },
  )
  .patch(
    "/sizes/:id",
    ({ prisma, params, body }) =>
      prisma.productSize.update({ where: { id: params.id }, data: body }),
    {
      admin: true,
      params: idParamsSchema,
      body: sizeBodySchema.partial(),
      detail: { summary: "Update a size", tags: ["Admin", "Variants"] },
    },
  )
  .delete(
    "/sizes/:id",
    ({ prisma, params }) =>
      prisma.productSize.delete({ where: { id: params.id } }).then(() => ({
        ok: true,
      })),
    {
      admin: true,
      params: idParamsSchema,
      detail: { summary: "Delete a size", tags: ["Admin", "Variants"] },
    },
  );
