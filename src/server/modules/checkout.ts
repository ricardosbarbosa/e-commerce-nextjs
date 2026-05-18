import type { Session } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripeClient } from "@/lib/stripe";
import { authenticatedPlugin } from "@/server/plugins/authenticated";
import { Elysia, type Context } from "elysia";

const DEFAULT_SHIPPING_RATE_ID = "standard";

function formValue(body: unknown, name: string) {
  if (body instanceof FormData || body instanceof URLSearchParams) {
    const value = body.get(name);
    return typeof value === "string" ? value.trim() : "";
  }

  if (typeof body !== "object" || body === null) {
    return "";
  }

  const value = (body as Record<string, unknown>)[name];

  if (typeof value === "string") {
    return value.trim();
  }

  if (Array.isArray(value) && typeof value[0] === "string") {
    return value[0].trim();
  }

  return "";
}

function redirectTo(request: Request, path: string) {
  return Response.redirect(new URL(path, request.url), 303);
}

function priceToCents(price: unknown) {
  return Math.round(Number(price) * 100);
}

function stripeImageUrl(imageSrc: string | undefined, origin: string) {
  if (!imageSrc) {
    return undefined;
  }

  return new URL(imageSrc, origin).toString();
}

function isMissingStripeCustomerError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    "param" in error &&
    error.code === "resource_missing" &&
    error.param === "customer"
  );
}

type AuthenticatedContext = Context & Session;

async function createStripeCheckoutSession(context: AuthenticatedContext) {
  const { request } = context;

  if (!stripeClient) {
    context.set.status = 503;
    return {
      error:
        "Stripe is not configured. Set STRIPE_SECRET_KEY to enable checkout.",
    };
  }

  const submittedEmail = formValue(context.body, "email-address");
  const shippingRateId =
    formValue(context.body, "shippingRateId") || DEFAULT_SHIPPING_RATE_ID;
  const customerEmail = context.user.email ?? submittedEmail;
  const origin = new URL(request.url).origin;

  const cart = await prisma.cart.findFirst({
    where: {
      userId: context.user.id,
      status: "ACTIVE",
    },
    include: {
      items: {
        include: {
          product: {
            include: {
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
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  if (!cart || cart.items.length === 0) {
    context.set.status = 409;
    return { error: "Your cart is empty." };
  }

  const unavailableItem = cart.items.find(
    (item) =>
      item.product.status !== "ACTIVE" ||
      (item.variant && item.variant.inventoryQuantity < item.quantity),
  );

  if (unavailableItem) {
    context.set.status = 409;
    return {
      error: `${unavailableItem.product.name} is no longer available in the requested quantity.`,
    };
  }

  const invalidPriceItem = cart.items.find(
    (item) => priceToCents(item.unitPriceSnapshot) < 1,
  );

  if (invalidPriceItem) {
    context.set.status = 409;
    return {
      error: `${invalidPriceItem.product.name} has an invalid checkout price.`,
    };
  }

  const lineItems = cart.items.map((item) => {
    const image = item.variant?.images[0] ?? item.product.images[0];
    const imageUrl = stripeImageUrl(image?.imageSrc, origin);
    const variantLabel = [
      item.variant?.color?.name,
      item.variant?.size?.name,
      item.variant?.name,
    ]
      .filter(Boolean)
      .join(" / ");
    const productName = variantLabel
      ? `${item.product.name} - ${variantLabel}`
      : item.product.name;
    const unitAmount = priceToCents(item.unitPriceSnapshot);

    return {
      price_data: {
        currency: cart.currency.toLowerCase(),
        product_data: {
          name: productName,
          images: imageUrl ? [imageUrl] : undefined,
        },
        unit_amount: unitAmount,
      },
      quantity: item.quantity,
    };
  });

  let stripeCustomerId: string | undefined;

  const user = await prisma.user.findUnique({
    where: { id: context.user.id },
    select: {
      email: true,
      name: true,
      stripeCustomerId: true,
    },
  });

  stripeCustomerId = user?.stripeCustomerId ?? undefined;

  if (stripeCustomerId) {
    try {
      const customer = await stripeClient.customers.retrieve(stripeCustomerId);

      if (customer.deleted) {
        stripeCustomerId = undefined;
      }
    } catch (error) {
      if (!isMissingStripeCustomerError(error)) {
        throw error;
      }

      stripeCustomerId = undefined;
    }
  }

  if (!stripeCustomerId) {
    const customer = await stripeClient.customers.create({
      email: user?.email ?? (customerEmail || undefined),
      name: user?.name ?? context.user.name ?? undefined,
      metadata: {
        betterAuthUserId: context.user.id,
      },
    });

    stripeCustomerId = customer.id;

    await prisma.user.update({
      where: { id: context.user.id },
      data: { stripeCustomerId },
    });
  }

  const checkoutSession = await stripeClient.checkout.sessions.create({
    mode: "payment",
    customer: stripeCustomerId,
    customer_email: stripeCustomerId ? undefined : customerEmail || undefined,
    line_items: lineItems,
    metadata: {
      cartId: cart.id,
      shippingRateId,
      betterAuthUserId: context.user.id,
    },
    success_url: `${origin}/checkout?payment=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/checkout?payment=cancelled`,
    invoice_creation: {
      enabled: true,
    },
  });

  if (!checkoutSession.url) {
    context.set.status = 502;
    return { error: "Stripe did not return a checkout URL." };
  }

  // TODO: save session id to database

  return redirectTo(request, checkoutSession.url);
}

export const checkoutModule = new Elysia({ name: "checkout" })
  .use(authenticatedPlugin)
  .post("/checkout/stripe", (context) => createStripeCheckoutSession(context), {
    authenticated: true,
    parse: "urlencoded",
    detail: {
      summary: "Create a Stripe Checkout session",
      tags: ["Checkout"],
    },
  });
