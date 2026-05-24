import { Prisma } from "@/generated/prisma/client";
import { prismaPlugin } from "@/server/plugins/prisma";
import { Elysia, t } from "elysia";
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
        status: "ACTIVE",
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
        summary: "Get products",
        tags: ["Products"],
      },
    },
  )
  .get(
    "/:slug",
    ({ prisma, params }) => {
      return prisma.product.findFirst({
        where: { slug: params.slug, status: "ACTIVE" },
        include: {
          images: true,
          variants: {
            include: {
              color: true,
              size: true,
              images: true,
            },
          },
          reviews: {
            take: 1,
            orderBy: {
              publishedAt: "desc",
            },
          },
          recommendations: {
            include: {
              recommendedProduct: {
                include: {
                  images: true,
                  variants: {
                    include: {
                      color: true,
                      size: true,
                      images: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
    },
    {
      params: z.object({
        slug: z.string(),
      }),
      detail: {
        summary: "Get product by id",
        tags: ["Products"],
      },
    },
  )
  .get(
    "/:slug/colors",
    ({ prisma, params }) => {
      return prisma.productColor.findMany({
        where: {
          variants: {
            some: {
              product: {
                slug: params.slug,
                status: "ACTIVE",
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
      params: z.object({
        slug: z.string(),
      }),
      detail: {
        summary: "Get colors by product slug",
        tags: ["Products"],
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
                slug: params.slug,
                status: "ACTIVE",
              },
            },
          },
        },
        orderBy: {
          sortOrder: "asc",
        },
      });
    },
    {
      params: t.Object({
        slug: t.String(),
      }),
      detail: {
        summary: "Get sizes by product slug",
        tags: ["Products"],
      },
    },
  )
  .get(
    // should return the total count and the average rating and the reviews paginated
    "/:slug/reviews",
    async ({ prisma, params, query }) => {
      const { page = "1", limit = "10" } = query;

      const totalCount = await prisma.productReview.count({
        where: { product: { slug: params.slug, status: "ACTIVE" } },
      });
      const averageRating = await prisma.productReview
        .aggregate({
          where: { product: { slug: params.slug, status: "ACTIVE" } },
          _avg: { rating: true },
        })
        .then((result) => result._avg.rating ?? 0);

      const reviews = await prisma.productReview.findMany({
        where: { product: { slug: params.slug, status: "ACTIVE" } },
        select: {
          id: true,
          authorName: true,
          title: true,
          content: true,
          rating: true,
          publishedAt: true,
        },
        orderBy: {
          publishedAt: "desc",
        },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      });

      return {
        totalCount,
        averageRating,
        reviews,
      };
    },
    {
      params: z.object({
        slug: z.string(),
      }),
      // query params are strings by default
      query: z.object({
        page: z.string().optional(),
        limit: z.string().optional(),
      }),
      detail: {
        summary: "Get reviews by product slug paginated",
        tags: ["Products", "Reviews"],
      },
    },
  );
