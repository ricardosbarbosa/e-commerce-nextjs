import type { Session } from "@/lib/auth";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { stripeClient } from "@/lib/stripe";
import { authenticatedPlugin } from "@/server/plugins/authenticated";
import { Elysia, type Context } from "elysia";
import type Stripe from "stripe";
import * as z from "zod";

const DEFAULT_SHIPPING_RATE_ID = "standard";

const completeCheckoutParamsSchema = z.object({
  sessionId: z.string().min(1),
});

const checkoutPaymentMessage = {
  cancelled:
    "Payment was cancelled. You can review your details and try again.",
  failed: "Payment was not completed. Please try another payment method.",
} as const;

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

function redirectToCheckoutWithPaymentMessage(
  request: Request,
  payment: keyof typeof checkoutPaymentMessage,
) {
  const url = new URL("/checkout", request.url);
  url.searchParams.set("payment", payment);
  url.searchParams.set("message", checkoutPaymentMessage[payment]);

  return Response.redirect(url, 303);
}

function priceToCents(price: unknown) {
  return Math.round(Number(price) * 100);
}

function centsToDecimalString(cents: number) {
  return (cents / 100).toFixed(2);
}

function generateOrderNumber() {
  return `ORD-${Date.now().toString(36).toUpperCase()}-${crypto
    .randomUUID()
    .slice(0, 8)
    .toUpperCase()}`;
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

function isStripeInvoice(
  invoice: Stripe.Checkout.Session["invoice"],
): invoice is Stripe.Invoice {
  return typeof invoice === "object" && invoice !== null;
}

async function retrieveCheckoutSessionInvoice(
  checkoutSession: Stripe.Checkout.Session,
) {
  if (!stripeClient || !checkoutSession.invoice) {
    return null;
  }

  if (isStripeInvoice(checkoutSession.invoice)) {
    return checkoutSession.invoice;
  }

  return stripeClient.invoices.retrieve(checkoutSession.invoice);
}

function stripeInvoiceIssuedAt(invoice: Stripe.Invoice) {
  const timestamp =
    invoice.status_transitions.finalized_at ?? invoice.created ?? null;

  return timestamp ? new Date(timestamp * 1000) : null;
}

type AuthenticatedContext = Context & Session;
type CompleteCheckoutContext = AuthenticatedContext & {
  params: {
    sessionId: string;
  };
};

const checkoutCartInclude = {
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
} satisfies Prisma.CartInclude;

type CheckoutCart = Prisma.CartGetPayload<{
  include: typeof checkoutCartInclude;
}>;

function cartItemVariantName(item: CheckoutCart["items"][number]) {
  return [
    item.variant?.color?.name,
    item.variant?.size?.name,
    item.variant?.name,
  ]
    .filter(Boolean)
    .join(" / ");
}

async function createOrderFromCheckoutSession({
  cart,
  context,
  customerEmail,
  checkoutSessionId,
}: {
  cart: CheckoutCart;
  context: AuthenticatedContext;
  customerEmail: string;
  checkoutSessionId: string;
}) {
  const addressLine1 = formValue(context.body, "address");
  const city = formValue(context.body, "city");
  const region = formValue(context.body, "region");
  const postalCode = formValue(context.body, "postal-code");
  const canPersistAddress = Boolean(addressLine1 && city && postalCode);
  const subtotalCents = cart.items.reduce(
    (sum, item) => sum + priceToCents(item.unitPriceSnapshot) * item.quantity,
    0,
  );

  return prisma.$transaction(async (tx) => {
    const existingPayment = await tx.payment.findFirst({
      where: {
        provider: "STRIPE",
        providerRef: checkoutSessionId,
      },
      select: {
        order: {
          select: {
            id: true,
            number: true,
          },
        },
      },
    });

    if (existingPayment) {
      return existingPayment.order;
    }

    const shippingAddress = canPersistAddress
      ? await tx.address.create({
          data: {
            userId: context.user.id,
            name: context.user.name ?? customerEmail,
            email: customerEmail,
            line1: addressLine1,
            city,
            region: region || undefined,
            postalCode,
          },
        })
      : null;

    const order = await tx.order.create({
      data: {
        number: generateOrderNumber(),
        userId: context.user.id,
        email: customerEmail,
        currency: cart.currency,
        subtotalAmount: centsToDecimalString(subtotalCents),
        totalAmount: centsToDecimalString(subtotalCents),
        shippingAddressId: shippingAddress?.id,
        billingAddressId: shippingAddress?.id,
        items: {
          create: cart.items.map((item) => {
            const image = item.variant?.images[0] ?? item.product.images[0];
            const variantName = cartItemVariantName(item);

            return {
              productId: item.productId,
              variantId: item.variantId,
              productName: item.product.name,
              variantName: variantName || undefined,
              sku: item.variant?.sku,
              imageSrc: image?.imageSrc,
              imageAlt: image?.imageAlt,
              unitPrice: item.unitPriceSnapshot,
              quantity: item.quantity,
            };
          }),
        },
        payment: {
          create: {
            provider: "STRIPE",
            status: "PENDING",
            amount: centsToDecimalString(subtotalCents),
            currency: cart.currency,
            providerRef: checkoutSessionId,
          },
        },
      },
      select: {
        id: true,
        number: true,
      },
    });

    return order;
  });
}

async function completeStripeCheckoutSession(context: CompleteCheckoutContext) {
  if (!stripeClient) {
    context.set.status = 503;
    return {
      error:
        "Stripe is not configured. Set STRIPE_SECRET_KEY to enable checkout.",
    };
  }

  const checkoutSession = await stripeClient.checkout.sessions.retrieve(
    context.params.sessionId,
    {
      expand: ["invoice"],
    },
  );

  if (checkoutSession.metadata?.betterAuthUserId !== context.user.id) {
    context.set.status = 404;
    return { error: "Checkout session not found." };
  }

  const payment = await prisma.payment.findFirst({
    where: {
      provider: "STRIPE",
      providerRef: checkoutSession.id,
    },
    select: {
      orderId: true,
      status: true,
      order: {
        select: {
          id: true,
          number: true,
          userId: true,
        },
      },
    },
  });

  if (!payment || payment.order.userId !== context.user.id) {
    context.set.status = 404;
    return { error: "Order not found for this checkout session." };
  }

  if (checkoutSession.payment_status !== "paid") {
    context.set.status = 409;
    return {
      error: "Stripe has not confirmed payment for this checkout session.",
      paymentStatus: checkoutSession.payment_status,
      order: payment.order,
    };
  }

  const stripeInvoice = await retrieveCheckoutSessionInvoice(checkoutSession);

  const order = await prisma.$transaction(async (tx) => {
    const currentPayment = await tx.payment.findUnique({
      where: {
        orderId: payment.orderId,
      },
      select: {
        status: true,
      },
    });
    const wasAlreadyPaid = currentPayment?.status === "PAID";

    await tx.payment.update({
      where: {
        orderId: payment.orderId,
      },
      data: {
        status: "PAID",
      },
    });

    const confirmedOrder = await tx.order.update({
      where: {
        id: payment.orderId,
      },
      data: {
        status: "CONFIRMED",
        paymentStatus: "PAID",
      },
      select: {
        id: true,
        number: true,
        status: true,
        paymentStatus: true,
      },
    });

    if (!wasAlreadyPaid) {
      const orderItems = await tx.orderItem.findMany({
        where: {
          orderId: payment.orderId,
          variantId: {
            not: null,
          },
        },
        select: {
          variantId: true,
          quantity: true,
        },
      });

      await Promise.all(
        orderItems.map((item) =>
          tx.productVariant.update({
            where: {
              id: item.variantId!,
            },
            data: {
              inventoryQuantity: {
                decrement: item.quantity,
              },
            },
          }),
        ),
      );
    }

    if (stripeInvoice) {
      const invoiceNumber = stripeInvoice.number ?? stripeInvoice.id;
      const invoiceUrl =
        stripeInvoice.hosted_invoice_url ?? stripeInvoice.invoice_pdf;
      const issuedAt = stripeInvoiceIssuedAt(stripeInvoice);

      await tx.invoice.upsert({
        where: {
          orderId: payment.orderId,
        },
        create: {
          orderId: payment.orderId,
          number: invoiceNumber,
          url: invoiceUrl,
          issuedAt,
        },
        update: {
          number: invoiceNumber,
          url: invoiceUrl,
          issuedAt,
        },
      });
    }

    const cartId = checkoutSession.metadata?.cartId;

    if (cartId) {
      await tx.cart.updateMany({
        where: {
          id: cartId,
          userId: context.user.id,
          status: "ACTIVE",
        },
        data: {
          status: "CONVERTED",
        },
      });
    }

    return confirmedOrder;
  });

  return { order };
}

async function redirectAfterStripeCheckoutSession(
  context: CompleteCheckoutContext,
) {
  const result = await completeStripeCheckoutSession(context);
  const order = "order" in result ? result.order : null;

  if (order && "status" in order && order.status === "CONFIRMED") {
    return redirectTo(context.request, `/orders/${order.id}`);
  }

  return redirectToCheckoutWithPaymentMessage(context.request, "failed");
}

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
    include: checkoutCartInclude,
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

  if (!customerEmail) {
    context.set.status = 400;
    return { error: "Add an email address before checking out." };
  }

  const lineItems = cart.items.map((item) => {
    const image = item.variant?.images[0] ?? item.product.images[0];
    const imageUrl = stripeImageUrl(image?.imageSrc, origin);
    const variantLabel = cartItemVariantName(item);
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

  const checkoutSession = await stripeClient.checkout.sessions.create(
    {
      mode: "payment",
      customer: stripeCustomerId,
      customer_email: stripeCustomerId ? undefined : customerEmail,
      line_items: lineItems,
      metadata: {
        cartId: cart.id,
        shippingRateId,
        betterAuthUserId: context.user.id,
      },
      success_url: `${origin}/api/checkout/stripe/sessions/{CHECKOUT_SESSION_ID}/complete`,
      cancel_url: `${origin}/checkout?payment=cancelled`,
      invoice_creation: {
        enabled: true,
      },
    },
    {
      idempotencyKey: `checkout-cart-${cart.id}`,
    },
  );

  if (!checkoutSession.url) {
    context.set.status = 502;
    return { error: "Stripe did not return a checkout URL." };
  }

  const order = await createOrderFromCheckoutSession({
    cart,
    context,
    customerEmail,
    checkoutSessionId: checkoutSession.id,
  });

  await stripeClient.checkout.sessions.update(checkoutSession.id, {
    metadata: {
      cartId: cart.id,
      shippingRateId,
      betterAuthUserId: context.user.id,
      orderId: order.id,
      orderNumber: order.number,
    },
  });

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
  })
  .post(
    "/checkout/stripe/sessions/:sessionId/complete",
    (context) => completeStripeCheckoutSession(context),
    {
      authenticated: true,
      params: completeCheckoutParamsSchema,
      detail: {
        summary: "Complete a paid Stripe Checkout session",
        tags: ["Checkout"],
      },
    },
  )
  .get(
    "/checkout/stripe/sessions/:sessionId/complete",
    (context) => redirectAfterStripeCheckoutSession(context),
    {
      authenticated: true,
      params: completeCheckoutParamsSchema,
      detail: {
        summary: "Complete a paid Stripe Checkout session and redirect",
        tags: ["Checkout"],
      },
    },
  );
