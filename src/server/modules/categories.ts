import { prismaPlugin } from "@/server/plugins/prisma";
import { Elysia, t } from "elysia";

export const categoriesModule = new Elysia({
  name: "categories",
  prefix: "/categories",
})
  .use(prismaPlugin)
  .get(
    "/",
    ({ prisma }) => {
      return prisma.category.findMany();
    },
    {
      detail: {
        summary: "Get categories",
        tags: ["Categories"],
      },
    },
  )
  // get category by slug
  .get("/:slug", ({ prisma, params }) => {
    return prisma.category.findUnique({ where: { slug: params.slug } });
  })
  .get(
    "/:slug/colors",
    ({ prisma, params }) => {
      return prisma.productColor.findMany({
        where: {
          variants: {
            some: {
              product: {
                categories: { some: { category: { slug: params.slug } } },
              },
            },
          },
        },
        orderBy: {
          name: "asc",
        },
      });
    },
    {
      params: t.Object({
        slug: t.String(),
      }),
      detail: {
        summary: "Get colors by category slug",
        tags: ["Categories"],
      },
    },
  )
  .get(
    "/:slug/sizes",
    ({ prisma, params }) => {
      return prisma.productSize.findMany({
        where: {
          variants: {
            some: {
              product: {
                categories: { some: { category: { slug: params.slug } } },
              },
            },
          },
        },
        orderBy: {
          name: "asc",
        },
      });
    },
    {
      params: t.Object({
        slug: t.String(),
      }),
      detail: {
        summary: "Get sizes by category slug",
        tags: ["Categories"],
      },
    },
  );
