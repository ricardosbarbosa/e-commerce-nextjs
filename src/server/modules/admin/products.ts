import { Prisma } from "@/generated/prisma/client";
import { adminPlugin } from "@/server/plugins/admin";
import { prismaPlugin } from "@/server/plugins/prisma";
import { Elysia } from "elysia";
import * as z from "zod";
import {
  moneyStringSchema,
  paginationQuerySchema,
  productImageInputSchema,
  productSelect,
  productStatusSchema,
  serializeProduct,
} from "./shared";

const productListQuerySchema = paginationQuerySchema.extend({
  search: z.string().optional(),
  status: productStatusSchema.optional(),
  categoryId: z.string().optional(),
});

const productBodySchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  details: z.array(z.string()).optional(),
  status: productStatusSchema.optional(),
  price: moneyStringSchema,
  compareAtPrice: moneyStringSchema.optional().nullable(),
  currency: z.string().length(3).optional(),
  isFeatured: z.boolean().optional(),
  categoryIds: z.array(z.string()).optional(),
  images: z.array(productImageInputSchema).optional(),
});

const updateProductBodySchema = productBodySchema.partial();

function productData(body: z.infer<typeof productBodySchema>) {
  return {
    slug: body.slug,
    name: body.name,
    description: body.description ?? null,
    details: body.details ?? [],
    status: body.status ?? "DRAFT",
    price: body.price,
    compareAtPrice: body.compareAtPrice ?? null,
    currency: body.currency ?? "USD",
    isFeatured: body.isFeatured ?? false,
  };
}

function productUpdateData(body: z.infer<typeof updateProductBodySchema>) {
  return {
    ...(body.slug !== undefined ? { slug: body.slug } : {}),
    ...(body.name !== undefined ? { name: body.name } : {}),
    ...(body.description !== undefined
      ? { description: body.description ?? null }
      : {}),
    ...(body.details !== undefined ? { details: body.details } : {}),
    ...(body.status !== undefined ? { status: body.status } : {}),
    ...(body.price !== undefined ? { price: body.price } : {}),
    ...(body.compareAtPrice !== undefined
      ? { compareAtPrice: body.compareAtPrice ?? null }
      : {}),
    ...(body.currency !== undefined ? { currency: body.currency } : {}),
    ...(body.isFeatured !== undefined ? { isFeatured: body.isFeatured } : {}),
  };
}

export const adminProductsModule = new Elysia({
  name: "admin-products",
  prefix: "/products",
})
  .use(prismaPlugin)
  .use(adminPlugin)
  .get(
    "/",
    async ({ prisma, query }) => {
      const where: Prisma.ProductWhereInput = {
        ...(query.status ? { status: query.status } : {}),
        ...(query.search
          ? {
              OR: [
                { name: { contains: query.search, mode: "insensitive" } },
                { slug: { contains: query.search, mode: "insensitive" } },
              ],
            }
          : {}),
        ...(query.categoryId
          ? {
              categories: {
                some: {
                  categoryId: query.categoryId,
                },
              },
            }
          : {}),
      };

      const [total, products] = await Promise.all([
        prisma.product.count({ where }),
        prisma.product.findMany({
          where,
          select: productSelect,
          orderBy: {
            updatedAt: "desc",
          },
          take: query.limit ?? 50,
          skip: query.offset ?? 0,
        }),
      ]);

      return {
        products: products.map(serializeProduct),
        total,
        limit: query.limit ?? 50,
        offset: query.offset ?? 0,
      };
    },
    {
      admin: true,
      query: productListQuerySchema,
      detail: {
        summary: "List products",
        tags: ["Admin", "Products"],
      },
    },
  )
  .post(
    "/",
    async ({ prisma, body }) => {
      const product = await prisma.$transaction(async (tx) => {
        const created = await tx.product.create({
          data: productData(body),
        });

        if (body.categoryIds?.length) {
          await tx.productCategory.createMany({
            data: body.categoryIds.map((categoryId) => ({
              productId: created.id,
              categoryId,
            })),
          });
        }

        if (body.images?.length) {
          await tx.productImage.createMany({
            data: body.images.map((image, index) => ({
              productId: created.id,
              imageSrc: image.imageSrc,
              imageAlt: image.imageAlt ?? null,
              isPrimary: image.isPrimary ?? index === 0,
              sortOrder: image.sortOrder ?? index,
            })),
          });
        }

        return tx.product.findUniqueOrThrow({
          where: { id: created.id },
          select: productSelect,
        });
      });

      return { product: serializeProduct(product) };
    },
    {
      admin: true,
      body: productBodySchema,
      detail: {
        summary: "Create a product",
        tags: ["Admin", "Products"],
      },
    },
  )
  .get(
    "/:productId",
    async ({ prisma, params, status }) => {
      const product = await prisma.product.findUnique({
        where: { id: params.productId },
        select: productSelect,
      });

      if (!product) {
        return status(404, { error: "Product not found." });
      }

      return { product: serializeProduct(product) };
    },
    {
      admin: true,
      params: z.object({ productId: z.string().min(1) }),
      detail: {
        summary: "Get a product",
        tags: ["Admin", "Products"],
      },
    },
  )
  .patch(
    "/:productId",
    async ({ prisma, params, body, status }) => {
      const existing = await prisma.product.findUnique({
        where: { id: params.productId },
        select: { id: true },
      });

      if (!existing) {
        return status(404, { error: "Product not found." });
      }

      const product = await prisma.$transaction(async (tx) => {
        await tx.product.update({
          where: { id: params.productId },
          data: productUpdateData(body),
        });

        if (body.categoryIds) {
          await tx.productCategory.deleteMany({
            where: { productId: params.productId },
          });
          if (body.categoryIds.length) {
            await tx.productCategory.createMany({
              data: body.categoryIds.map((categoryId) => ({
                productId: params.productId,
                categoryId,
              })),
            });
          }
        }

        if (body.images) {
          await tx.productImage.deleteMany({
            where: { productId: params.productId, variantId: null },
          });
          if (body.images.length) {
            await tx.productImage.createMany({
              data: body.images.map((image, index) => ({
                productId: params.productId,
                imageSrc: image.imageSrc,
                imageAlt: image.imageAlt ?? null,
                isPrimary: image.isPrimary ?? index === 0,
                sortOrder: image.sortOrder ?? index,
              })),
            });
          }
        }

        return tx.product.findUniqueOrThrow({
          where: { id: params.productId },
          select: productSelect,
        });
      });

      return { product: serializeProduct(product) };
    },
    {
      admin: true,
      params: z.object({ productId: z.string().min(1) }),
      body: updateProductBodySchema,
      detail: {
        summary: "Update a product",
        tags: ["Admin", "Products"],
      },
    },
  )
  .delete(
    "/:productId",
    async ({ prisma, params, status }) => {
      const existing = await prisma.product.findUnique({
        where: { id: params.productId },
        select: { id: true },
      });

      if (!existing) {
        return status(404, { error: "Product not found." });
      }

      await prisma.product.delete({
        where: { id: params.productId },
      });

      return { ok: true };
    },
    {
      admin: true,
      params: z.object({ productId: z.string().min(1) }),
      detail: {
        summary: "Delete a product",
        tags: ["Admin", "Products"],
      },
    },
  );
