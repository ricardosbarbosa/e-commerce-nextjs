import { auth } from "@/lib/auth";
import { Elysia, type Context } from "elysia";

const BETTER_AUTH_ACCEPT_METHODS = new Set(["GET", "POST"]);

function betterAuthView(context: Context) {
  if (!BETTER_AUTH_ACCEPT_METHODS.has(context.request.method)) {
    context.set.status = 405;
    return;
  }
  return auth.handler(context.request);
}

/** Better Auth at `/api/auth/*` (combined with API prefix). */
export const authModule = new Elysia({ name: "better-auth" }).all(
  "/auth/*",
  betterAuthView,
);
