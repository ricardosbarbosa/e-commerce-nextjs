import { betterAuth } from "better-auth";
import { stripe } from "@better-auth/stripe";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { admin, openAPI } from "better-auth/plugins";

import { prisma } from "./prisma";
import { sendEmail } from "./email";
import { stripeClient } from "./stripe";

const baseURL = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

const trustedOrigins = (
  process.env.BETTER_AUTH_TRUSTED_ORIGINS?.split(",") ?? [baseURL]
)
  .map((o) => o.trim())
  .filter(Boolean);

const authPlugins = [
  admin(),
  nextCookies(),
  openAPI(),
  ...(stripeClient && stripeWebhookSecret
    ? [
        stripe({
          stripeClient,
          stripeWebhookSecret,
          createCustomerOnSignUp: true,
          subscription: {
            enabled: false,
          },
        }),
      ]
    : []),
];

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  plugins: authPlugins,
  baseURL,
  basePath: "/api/auth",
  emailAndPassword: {
    enabled: true,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url, token }) => {
      void sendEmail({
        to: user.email,
        subject: "Reset your password",
        text: `Click the link to reset your password: ${url}`,
        html: `<p>Click the link to reset your password:</p><p><a href="${url}">Reset password</a></p>`,
        idempotencyKey: `password-reset/${token}`,
      });
    },
    onPasswordReset: async ({ user }) => {
      console.info(`Password reset completed for ${user.email}.`);
    },
  },
  trustedOrigins,
});

export type Session = typeof auth.$Infer.Session;
