import { prismaPlugin } from "@/server/plugins/prisma";
import { adminPlugin } from "@/server/plugins/admin";
import { Elysia } from "elysia";

export const adminDashboardModule = new Elysia({
  name: "admin-dashboard",
})
  .use(prismaPlugin)
  .use(adminPlugin)
  .get(
    "/dashboard",
    async ({ prisma }) => {
      const [
        totalUsers,
        activeProducts,
        draftProductsCount,
        openOrders,
        lowStockCount,
        recentOrders,
        lowStockVariants,
        draftProducts,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.product.count({ where: { status: "ACTIVE" } }),
        prisma.product.count({ where: { status: "DRAFT" } }),
        prisma.order.count({
          where: {
            fulfillmentStatus: {
              in: ["NOT_FULFILLED", "PROCESSING", "SHIPPED"],
            },
          },
        }),
        prisma.productVariant.count({
          where: {
            inventoryQuantity: {
              lte: 5,
            },
          },
        }),
        prisma.order.findMany({
          take: 8,
          orderBy: {
            placedAt: "desc",
          },
          select: {
            id: true,
            number: true,
            email: true,
            totalAmount: true,
            status: true,
            fulfillmentStatus: true,
            placedAt: true,
          },
        }),
        prisma.productVariant.findMany({
          take: 8,
          where: {
            inventoryQuantity: {
              lte: 5,
            },
          },
          orderBy: {
            inventoryQuantity: "asc",
          },
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
            color: true,
            size: true,
          },
        }),
        prisma.product.findMany({
          take: 8,
          where: {
            status: "DRAFT",
          },
          orderBy: {
            updatedAt: "desc",
          },
          select: {
            id: true,
            name: true,
            slug: true,
            updatedAt: true,
          },
        }),
      ]);

      return {
        metrics: {
          totalUsers,
          activeProducts,
          draftProducts: draftProductsCount,
          openOrders,
          lowStockVariants: lowStockCount,
        },
        queues: {
          recentOrders: recentOrders.map((order) => ({
            ...order,
            totalAmount: Number(order.totalAmount),
            placedAt: order.placedAt.toISOString(),
          })),
          lowStockVariants: lowStockVariants.map((variant) => ({
            ...variant,
            price: variant.price ? Number(variant.price) : null,
          })),
          draftProducts: draftProducts.map((product) => ({
            ...product,
            updatedAt: product.updatedAt.toISOString(),
          })),
        },
      };
    },
    {
      admin: true,
      detail: {
        summary: "Get admin dashboard queues and metrics",
        tags: ["Admin"],
      },
    },
  );
