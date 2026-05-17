import type { Session } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripeClient } from "@/lib/stripe";
import { authenticatedPlugin } from "@/server/plugins/authenticated";
import { Elysia, type Context } from "elysia";

const SIMULATED_CHECKOUT_AMOUNT_CENTS = 34168;

function formValue(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function redirectTo(request: Request, path: string) {
  return Response.redirect(new URL(path, request.url), 303);
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

  const formData = await request.formData();
  const submittedEmail = formValue(formData, "email-address");
  const customerEmail = context.user.email ?? submittedEmail;
  const origin = new URL(request.url).origin;

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
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "Demo e-commerce order",
          },
          unit_amount: SIMULATED_CHECKOUT_AMOUNT_CENTS,
        },
        quantity: 1,
      },
    ],
    metadata: {
      simulated: "true",
      betterAuthUserId: context.user.id,
    },
    success_url: `${origin}/checkout?payment=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/checkout?payment=cancelled`,
    invoice_creation: {
      enabled: true,
    },
    currency: "usd",
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
    detail: {
      summary: "Create a Stripe Checkout session",
      tags: ["Checkout"],
    },
  });
