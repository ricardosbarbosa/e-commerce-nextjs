import { authenticatedPlugin } from "@/server/plugins/authenticated";
import { prismaPlugin } from "@/server/plugins/prisma";
import { Elysia } from "elysia";
import * as z from "zod";

const addCartItemBodySchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().min(1).optional(),
  quantity: z.number().int().min(1).max(99).default(1),
});

const adjustCartItemBodySchema = z.object({
  delta: z.union([z.literal(-1), z.literal(1)]),
});

const cartItemParamsSchema = z.object({
  itemId: z.string().min(1),
});

const cartItemInclude = {
  product: {
    select: {
      id: true,
      slug: true,
      name: true,
      price: true,
      currency: true,
      images: {
        orderBy: [
          { isPrimary: "desc" as const },
          { sortOrder: "asc" as const },
        ],
        take: 1,
      },
    },
  },
  variant: {
    include: {
      color: true,
      size: true,
      images: {
        orderBy: [
          { isPrimary: "desc" as const },
          { sortOrder: "asc" as const },
        ],
        take: 1,
      },
    },
  },
};

export const cartModule = new Elysia({
  name: "cart",
  prefix: "/cart",
})
  .use(prismaPlugin)
  .use(authenticatedPlugin)
  .get(
    "/",
    async ({ prisma, user }) => {
      const cart = await prisma.cart.findFirst({
        where: {
          userId: user.id,
          status: "ACTIVE",
        },
        include: {
          _count: {
            select: {
              items: true,
            },
          },
          items: {
            include: {
              product: {
                include: {
                  images: true,
                },
              },
              variant: {
                include: {
                  color: true,
                  size: true,
                },
              },
            },
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
      });

      return {
        cartId: cart?.id ?? null,
        itemCount: cart?._count.items ?? 0,
        totalQuantity:
          cart?.items.reduce((total, item) => total + item.quantity, 0) ?? 0,
        items: cart?.items.map((item) => ({
          id: item.id,
          product: item.product,
          variant: item.variant,
          quantity: item.quantity,
        })),
      };
    },
    {
      authenticated: true,
      detail: {
        summary: "Get the active cart summary",
        tags: ["Cart"],
      },
    },
  )
  .post(
    "/items",
    async ({ prisma, body, user, status }) => {
      const product = await prisma.product.findFirst({
        where: {
          id: body.productId,
          status: "ACTIVE",
        },
        select: {
          id: true,
          price: true,
          currency: true,
        },
      });

      if (!product) {
        return status(404, { error: "Product not found." });
      }

      const variant = body.variantId
        ? await prisma.productVariant.findFirst({
            where: {
              id: body.variantId,
              productId: product.id,
            },
            select: {
              id: true,
              price: true,
              inventoryQuantity: true,
            },
          })
        : null;

      if (body.variantId && !variant) {
        return status(400, {
          error: "Selected variant does not belong to this product.",
        });
      }

      if (variant && variant.inventoryQuantity < body.quantity) {
        return status(409, { error: "Not enough inventory for this variant." });
      }

      const cart = await prisma.cart.findFirst({
        where: {
          userId: user.id,
          status: "ACTIVE",
        },
        orderBy: {
          updatedAt: "desc",
        },
      });

      if (cart && cart.currency !== product.currency) {
        return status(409, {
          error: "Cart currency does not match this product.",
        });
      }

      const activeCart =
        cart ??
        (await prisma.cart.create({
          data: {
            userId: user.id,
            currency: product.currency,
          },
        }));

      const existingItem = await prisma.cartItem.findFirst({
        where: {
          cartId: activeCart.id,
          productId: product.id,
          variantId: variant?.id ?? null,
        },
      });

      const nextQuantity = (existingItem?.quantity ?? 0) + body.quantity;

      if (variant && nextQuantity > variant.inventoryQuantity) {
        return status(409, { error: "Not enough inventory for this variant." });
      }

      const item = existingItem
        ? await prisma.cartItem.update({
            where: {
              id: existingItem.id,
            },
            data: {
              quantity: nextQuantity,
            },
            include: cartItemInclude,
          })
        : await prisma.cartItem.create({
            data: {
              cartId: activeCart.id,
              productId: product.id,
              variantId: variant?.id,
              quantity: body.quantity,
              unitPriceSnapshot: variant?.price ?? product.price,
            },
            include: cartItemInclude,
          });

      const totalQuantity = await prisma.cartItem
        .aggregate({
          where: {
            cartId: activeCart.id,
          },
          _sum: {
            quantity: true,
          },
        })
        .then((result) => result._sum.quantity ?? 0);

      return {
        cartId: activeCart.id,
        item,
        totalQuantity,
      };
    },
    {
      authenticated: true,
      body: addCartItemBodySchema,
      detail: {
        summary: "Add an item to the active cart",
        tags: ["Cart"],
      },
    },
  )
  .patch(
    "/items/:itemId",
    async ({ prisma, params, body, user, status }) => {
      const existingItem = await prisma.cartItem.findFirst({
        where: {
          id: params.itemId,
          cart: {
            userId: user.id,
            status: "ACTIVE",
          },
        },
        include: cartItemInclude,
      });

      if (!existingItem) {
        return status(404, { error: "Cart item not found." });
      }

      const nextQuantity = existingItem.quantity + body.delta;

      if (nextQuantity < 1) {
        return status(409, { error: "Quantity cannot be less than 1." });
      }

      if (nextQuantity > 99) {
        return status(409, { error: "Quantity cannot be greater than 99." });
      }

      if (
        existingItem.variant &&
        nextQuantity > existingItem.variant.inventoryQuantity
      ) {
        return status(409, { error: "Not enough inventory for this variant." });
      }

      const item = await prisma.cartItem.update({
        where: {
          id: existingItem.id,
        },
        data: {
          quantity: nextQuantity,
        },
        include: cartItemInclude,
      });

      const totalQuantity = await prisma.cartItem
        .aggregate({
          where: {
            cartId: existingItem.cartId,
          },
          _sum: {
            quantity: true,
          },
        })
        .then((result) => result._sum.quantity ?? 0);

      return {
        cartId: existingItem.cartId,
        item,
        totalQuantity,
      };
    },
    {
      authenticated: true,
      params: cartItemParamsSchema,
      body: adjustCartItemBodySchema,
      detail: {
        summary: "Increment or decrement a cart item quantity",
        tags: ["Cart"],
      },
    },
  )
  .delete(
    "/items/:itemId",
    async ({ prisma, params, user, status }) => {
      const existingItem = await prisma.cartItem.findFirst({
        where: {
          id: params.itemId,
          cart: {
            userId: user.id,
            status: "ACTIVE",
          },
        },
        select: {
          id: true,
          cartId: true,
        },
      });

      if (!existingItem) {
        return status(404, { error: "Cart item not found." });
      }

      await prisma.cartItem.delete({
        where: {
          id: existingItem.id,
        },
      });

      const totalQuantity = await prisma.cartItem
        .aggregate({
          where: {
            cartId: existingItem.cartId,
          },
          _sum: {
            quantity: true,
          },
        })
        .then((result) => result._sum.quantity ?? 0);

      return {
        cartId: existingItem.cartId,
        itemId: existingItem.id,
        totalQuantity,
      };
    },
    {
      authenticated: true,
      params: cartItemParamsSchema,
      detail: {
        summary: "Remove an item from the active cart",
        tags: ["Cart"],
      },
    },
  );
