import { adminPlugin } from "@/server/plugins/admin";
import { prismaPlugin } from "@/server/plugins/prisma";
import { Elysia } from "elysia";
import * as z from "zod";
import { idParamsSchema } from "./shared";

const categoryBodySchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  imageSrc: z.string().url().optional().nullable(),
  imageAlt: z.string().optional().nullable(),
  parentId: z.string().optional().nullable(),
});

export const adminCategoriesModule = new Elysia({
  name: "admin-categories",
  prefix: "/categories",
})
  .use(prismaPlugin)
  .use(adminPlugin)
  .get(
    "/",
    async ({ prisma }) => {
      const categories = await prisma.category.findMany({
        include: {
          parent: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          _count: {
            select: {
              products: true,
              children: true,
            },
          },
        },
        orderBy: { name: "asc" },
      });

      return { categories };
    },
    {
      admin: true,
      detail: {
        summary: "List categories",
        tags: ["Admin", "Categories"],
      },
    },
  )
  .post("/", ({ prisma, body }) => prisma.category.create({ data: body }), {
    admin: true,
    body: categoryBodySchema,
    detail: {
      summary: "Create a category",
      tags: ["Admin", "Categories"],
    },
  })
  .patch(
    "/:id",
    async ({ prisma, params, body, status }) => {
      const category = await prisma.category
        .update({
          where: { id: params.id },
          data: body,
        })
        .catch(() => null);

      if (!category) {
        return status(404, { error: "Category not found." });
      }

      return { category };
    },
    {
      admin: true,
      params: idParamsSchema,
      body: categoryBodySchema.partial(),
      detail: {
        summary: "Update a category",
        tags: ["Admin", "Categories"],
      },
    },
  )
  .delete(
    "/:id",
    async ({ prisma, params, status }) => {
      const category = await prisma.category
        .delete({ where: { id: params.id } })
        .catch(() => null);

      if (!category) {
        return status(404, { error: "Category not found." });
      }

      return { ok: true };
    },
    {
      admin: true,
      params: idParamsSchema,
      detail: {
        summary: "Delete a category",
        tags: ["Admin", "Categories"],
      },
    },
  );
