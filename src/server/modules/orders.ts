import type { Prisma } from "@/generated/prisma/client";
import { authenticatedPlugin } from "@/server/plugins/authenticated";
import { prismaPlugin } from "@/server/plugins/prisma";
import { Elysia } from "elysia";
import * as z from "zod";

const orderParamsSchema = z.object({
  orderId: z.string().min(1),
});

const orderListItemSelect = {
  id: true,
  productName: true,
  variantName: true,
  imageSrc: true,
  imageAlt: true,
  unitPrice: true,
  quantity: true,
  fulfillmentStatus: true,
  product: {
    select: {
      slug: true,
      description: true,
    },
  },
} satisfies Prisma.OrderItemSelect;

const orderListSelect = {
  id: true,
  number: true,
  status: true,
  paymentStatus: true,
  fulfillmentStatus: true,
  currency: true,
  totalAmount: true,
  placedAt: true,
  items: {
    select: orderListItemSelect,
    orderBy: {
      createdAt: "asc",
    },
  },
  invoice: {
    select: {
      url: true,
    },
  },
} satisfies Prisma.OrderSelect;

const orderDetailSelect = {
  ...orderListSelect,
  email: true,
  subtotalAmount: true,
  discountAmount: true,
  shippingAmount: true,
  taxAmount: true,
  shippingAddress: {
    select: {
      name: true,
      email: true,
      phone: true,
      line1: true,
      line2: true,
      city: true,
      region: true,
      postalCode: true,
      country: true,
    },
  },
  billingAddress: {
    select: {
      name: true,
      email: true,
      phone: true,
      line1: true,
      line2: true,
      city: true,
      region: true,
      postalCode: true,
      country: true,
    },
  },
  payment: {
    select: {
      provider: true,
      status: true,
      amount: true,
      currency: true,
      brand: true,
      last4: true,
      expMonth: true,
      expYear: true,
    },
  },
} satisfies Prisma.OrderSelect;

type OrderListRecord = Prisma.OrderGetPayload<{
  select: typeof orderListSelect;
}>;

type OrderDetailRecord = Prisma.OrderGetPayload<{
  select: typeof orderDetailSelect;
}>;

function serializeOrderItem(item: OrderListRecord["items"][number]) {
  return {
    id: item.id,
    productName: item.productName,
    variantName: item.variantName,
    description: item.product?.description ?? null,
    href: item.product?.slug ? `/products/${item.product.slug}` : null,
    imageSrc: item.imageSrc,
    imageAlt: item.imageAlt,
    unitPrice: Number(item.unitPrice),
    quantity: item.quantity,
    fulfillmentStatus: item.fulfillmentStatus,
  };
}

function serializeOrderListItem(order: OrderListRecord) {
  return {
    id: order.id,
    number: order.number,
    status: order.status,
    paymentStatus: order.paymentStatus,
    fulfillmentStatus: order.fulfillmentStatus,
    currency: order.currency,
    totalAmount: Number(order.totalAmount),
    placedAt: order.placedAt.toISOString(),
    href: `/orders/${order.id}`,
    invoiceUrl: order.invoice?.url ?? null,
    items: order.items.map(serializeOrderItem),
  };
}

function serializeAddress(
  address:
    | OrderDetailRecord["shippingAddress"]
    | OrderDetailRecord["billingAddress"],
) {
  if (!address) {
    return null;
  }

  return {
    name: address.name,
    email: address.email,
    phone: address.phone,
    line1: address.line1,
    line2: address.line2,
    city: address.city,
    region: address.region,
    postalCode: address.postalCode,
    country: address.country,
  };
}

function serializeOrderDetail(order: OrderDetailRecord) {
  return {
    ...serializeOrderListItem(order),
    email: order.email,
    subtotalAmount: Number(order.subtotalAmount),
    discountAmount: Number(order.discountAmount),
    shippingAmount: Number(order.shippingAmount),
    taxAmount: Number(order.taxAmount),
    shippingAddress: serializeAddress(order.shippingAddress),
    billingAddress: serializeAddress(order.billingAddress),
    payment: order.payment
      ? {
          provider: order.payment.provider,
          status: order.payment.status,
          amount: Number(order.payment.amount),
          currency: order.payment.currency,
          brand: order.payment.brand,
          last4: order.payment.last4,
          expMonth: order.payment.expMonth,
          expYear: order.payment.expYear,
        }
      : null,
  };
}

export const ordersModule = new Elysia({
  name: "orders",
  prefix: "/orders",
})
  .use(prismaPlugin)
  .use(authenticatedPlugin)
  .get(
    "/",
    async ({ prisma, user }) => {
      const orders = await prisma.order.findMany({
        where: {
          userId: user.id,
        },
        select: orderListSelect,
        orderBy: {
          placedAt: "desc",
        },
      });

      return {
        orders: orders.map(serializeOrderListItem),
      };
    },
    {
      authenticated: true,
      detail: {
        summary: "Get the current user's orders",
        tags: ["Orders"],
      },
    },
  )
  .get(
    "/:orderId",
    async ({ prisma, params, user, status }) => {
      const order = await prisma.order.findFirst({
        where: {
          userId: user.id,
          OR: [{ id: params.orderId }, { number: params.orderId }],
        },
        select: orderDetailSelect,
      });

      if (!order) {
        return status(404, { error: "Order not found." });
      }

      return {
        order: serializeOrderDetail(order),
      };
    },
    {
      authenticated: true,
      params: orderParamsSchema,
      detail: {
        summary: "Get an order by id or number",
        tags: ["Orders"],
      },
    },
  );
