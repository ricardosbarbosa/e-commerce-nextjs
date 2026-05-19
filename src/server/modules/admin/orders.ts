import { Prisma } from "@/generated/prisma/client";
import { adminPlugin } from "@/server/plugins/admin";
import { prismaPlugin } from "@/server/plugins/prisma";
import { Elysia } from "elysia";
import * as z from "zod";
import {
  fulfillmentStatusSchema,
  orderSelect,
  orderStatusSchema,
  paginationQuerySchema,
  paymentStatusSchema,
  serializeOrder,
} from "./shared";

const orderListQuerySchema = paginationQuerySchema.extend({
  search: z.string().optional(),
  status: orderStatusSchema.optional(),
  paymentStatus: paymentStatusSchema.optional(),
  fulfillmentStatus: fulfillmentStatusSchema.optional(),
});

const updateOrderSchema = z.object({
  status: orderStatusSchema.optional(),
  paymentStatus: paymentStatusSchema.optional(),
  fulfillmentStatus: fulfillmentStatusSchema.optional(),
});

const itemParamsSchema = z.object({
  orderId: z.string().min(1),
  itemId: z.string().min(1),
});

const updateOrderItemSchema = z.object({
  fulfillmentStatus: fulfillmentStatusSchema,
  fulfilledAt: z.string().datetime().optional().nullable(),
});

export const adminOrdersModule = new Elysia({
  name: "admin-orders",
  prefix: "/orders",
})
  .use(prismaPlugin)
  .use(adminPlugin)
  .get(
    "/",
    async ({ prisma, query }) => {
      const where: Prisma.OrderWhereInput = {
        ...(query.status ? { status: query.status } : {}),
        ...(query.paymentStatus ? { paymentStatus: query.paymentStatus } : {}),
        ...(query.fulfillmentStatus
          ? { fulfillmentStatus: query.fulfillmentStatus }
          : {}),
        ...(query.search
          ? {
              OR: [
                { number: { contains: query.search, mode: "insensitive" } },
                { email: { contains: query.search, mode: "insensitive" } },
              ],
            }
          : {}),
      };

      const [total, orders] = await Promise.all([
        prisma.order.count({ where }),
        prisma.order.findMany({
          where,
          select: orderSelect,
          orderBy: { placedAt: "desc" },
          take: query.limit ?? 50,
          skip: query.offset ?? 0,
        }),
      ]);

      return {
        orders: orders.map(serializeOrder),
        total,
        limit: query.limit ?? 50,
        offset: query.offset ?? 0,
      };
    },
    {
      admin: true,
      query: orderListQuerySchema,
      detail: {
        summary: "List orders",
        tags: ["Admin", "Orders"],
      },
    },
  )
  .get(
    "/:orderId",
    async ({ prisma, params, status }) => {
      const order = await prisma.order.findFirst({
        where: {
          OR: [{ id: params.orderId }, { number: params.orderId }],
        },
        select: orderSelect,
      });

      if (!order) {
        return status(404, { error: "Order not found." });
      }

      return { order: serializeOrder(order) };
    },
    {
      admin: true,
      params: z.object({ orderId: z.string().min(1) }),
      detail: {
        summary: "Get an order",
        tags: ["Admin", "Orders"],
      },
    },
  )
  .patch(
    "/:orderId",
    async ({ prisma, params, body, status }) => {
      const order = await prisma.order
        .update({
          where: { id: params.orderId },
          data: body,
          select: orderSelect,
        })
        .catch(() => null);

      if (!order) {
        return status(404, { error: "Order not found." });
      }

      return { order: serializeOrder(order) };
    },
    {
      admin: true,
      params: z.object({ orderId: z.string().min(1) }),
      body: updateOrderSchema,
      detail: {
        summary: "Update order status",
        tags: ["Admin", "Orders"],
      },
    },
  )
  .patch(
    "/:orderId/items/:itemId",
    async ({ prisma, params, body, status }) => {
      const item = await prisma.orderItem
        .update({
          where: { id: params.itemId, orderId: params.orderId },
          data: {
            fulfillmentStatus: body.fulfillmentStatus,
            fulfilledAt:
              body.fulfilledAt === undefined
                ? undefined
                : body.fulfilledAt
                  ? new Date(body.fulfilledAt)
                  : null,
          },
        })
        .catch(() => null);

      if (!item) {
        return status(404, { error: "Order item not found." });
      }

      return {
        item: {
          ...item,
          unitPrice: Number(item.unitPrice),
          fulfilledAt: item.fulfilledAt?.toISOString() ?? null,
          createdAt: item.createdAt.toISOString(),
          updatedAt: item.updatedAt.toISOString(),
        },
      };
    },
    {
      admin: true,
      params: itemParamsSchema,
      body: updateOrderItemSchema,
      detail: {
        summary: "Update order item fulfillment",
        tags: ["Admin", "Orders"],
      },
    },
  );
