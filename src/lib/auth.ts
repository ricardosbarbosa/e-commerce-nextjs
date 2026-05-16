import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";

import { prisma } from "./prisma";

const baseURL = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

const trustedOrigins = (
  process.env.BETTER_AUTH_TRUSTED_ORIGINS?.split(",") ?? [baseURL]
)
  .map((o) => o.trim())
  .filter(Boolean);

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  plugins: [nextCookies()],
  baseURL,
  basePath: "/api/auth",
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins,
});

export type Session = typeof auth.$Infer.Session;
