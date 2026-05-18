import { Prisma } from "@/generated/prisma/client";
import { prismaPlugin } from "@/server/plugins/prisma";
import { Elysia } from "elysia";
import * as z from "zod";

export const productsModule = new Elysia({
  name: "products",
  prefix: "/products",
})
  .use(prismaPlugin)
  .post(
    "/",
    ({ prisma, body }) => {
      const { categorySlug, colors, sizes } = body;

      const where: Prisma.ProductWhereInput = {
        categories: {
          some: {
            category: { slug: categorySlug },
          },
        },
      };

      if (colors && colors.length > 0) {
        where.variants = {
          some: {
            color: { id: { in: colors } },
          },
        };
      }

      if (sizes && sizes.length > 0) {
        where.variants = {
          some: {
            size: { id: { in: sizes } },
          },
        };
      }

      return prisma.product.findMany({
        include: {
          images: true,
        },
        where,
        orderBy: { name: "asc" },
      });
    },
    {
      body: z.object({
        categorySlug: z.string().optional(),
        colors: z.array(z.string()).optional(),
        sizes: z.array(z.string()).optional(),
      }),
      detail: {
        summary: "Get categories",
        tags: ["Categories"],
      },
    },
  );
