import type { Prisma } from "@/generated/prisma/client";
import * as z from "zod";

export const paginationQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});

export const idParamsSchema = z.object({
  id: z.string().min(1),
});

export const productStatusSchema = z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]);
export const orderStatusSchema = z.enum([
  "PENDING",
  "CONFIRMED",
  "CANCELLED",
  "REFUNDED",
]);
export const paymentStatusSchema = z.enum([
  "PENDING",
  "AUTHORIZED",
  "PAID",
  "FAILED",
  "REFUNDED",
]);
export const fulfillmentStatusSchema = z.enum([
  "NOT_FULFILLED",
  "PROCESSING",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
]);

export const moneyStringSchema = z
  .string()
  .trim()
  .regex(/^\d+(\.\d{1,2})?$/, "Use a decimal value like 32.00.");

export const productImageInputSchema = z.object({
  id: z.string().optional(),
  imageSrc: z.string().url(),
  imageAlt: z.string().trim().optional().nullable(),
  isPrimary: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const productSelect = {
  id: true,
  slug: true,
  name: true,
  description: true,
  details: true,
  status: true,
  price: true,
  compareAtPrice: true,
  currency: true,
  isFeatured: true,
  createdAt: true,
  updatedAt: true,
  categories: {
    include: {
      category: true,
    },
    orderBy: {
      category: {
        name: "asc",
      },
    },
  },
  images: {
    orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
  },
  variants: {
    include: {
      color: true,
      size: true,
      images: {
        orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
      },
    },
    orderBy: [{ createdAt: "asc" }],
  },
} satisfies Prisma.ProductSelect;

export type AdminProductRecord = Prisma.ProductGetPayload<{
  select: typeof productSelect;
}>;

export function serializeProduct(product: AdminProductRecord) {
  return {
    ...product,
    price: Number(product.price),
    compareAtPrice: product.compareAtPrice
      ? Number(product.compareAtPrice)
      : null,
    categories: product.categories.map(({ category }) => category),
    variants: product.variants.map((variant) => ({
      ...variant,
      price: variant.price ? Number(variant.price) : null,
    })),
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
}

export const orderSelect = {
  id: true,
  number: true,
  userId: true,
  email: true,
  status: true,
  paymentStatus: true,
  fulfillmentStatus: true,
  currency: true,
  subtotalAmount: true,
  discountAmount: true,
  shippingAmount: true,
  taxAmount: true,
  totalAmount: true,
  placedAt: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  shippingAddress: true,
  billingAddress: true,
  payment: true,
  invoice: true,
  items: {
    orderBy: {
      createdAt: "asc",
    },
  },
} satisfies Prisma.OrderSelect;

export type AdminOrderRecord = Prisma.OrderGetPayload<{
  select: typeof orderSelect;
}>;

export function serializeOrder(order: AdminOrderRecord) {
  return {
    ...order,
    subtotalAmount: Number(order.subtotalAmount),
    discountAmount: Number(order.discountAmount),
    shippingAmount: Number(order.shippingAmount),
    taxAmount: Number(order.taxAmount),
    totalAmount: Number(order.totalAmount),
    placedAt: order.placedAt.toISOString(),
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    payment: order.payment
      ? {
          ...order.payment,
          amount: Number(order.payment.amount),
          createdAt: order.payment.createdAt.toISOString(),
          updatedAt: order.payment.updatedAt.toISOString(),
        }
      : null,
    invoice: order.invoice
      ? {
          ...order.invoice,
          issuedAt: order.invoice.issuedAt?.toISOString() ?? null,
          createdAt: order.invoice.createdAt.toISOString(),
          updatedAt: order.invoice.updatedAt.toISOString(),
        }
      : null,
    items: order.items.map((item) => ({
      ...item,
      unitPrice: Number(item.unitPrice),
      fulfilledAt: item.fulfilledAt?.toISOString() ?? null,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    })),
  };
}
