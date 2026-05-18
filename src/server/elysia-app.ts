import { openapi } from "@elysiajs/openapi";
import { Elysia } from "elysia";
import * as z from "zod";

import { prismaPlugin } from "./plugins/prisma";
import { authModule } from "./modules/auth";
import { checkoutModule } from "./modules/checkout";
import { healthModule } from "./modules/health";
import { categoriesModule } from "./modules/categories";
import { echoBodySchema } from "./schemas/echo";
import { productsModule } from "./modules/products";
import { cartModule } from "./modules/cart";

// Mounted by `src/app/api/[[...slugs]]/route.ts` at `/api`.
export const apiApp = new Elysia({ prefix: "/api" })
  .use(prismaPlugin)
  .use(
    openapi({
      mapJsonSchema: {
        zod: z.toJSONSchema,
      },
      documentation: {
        info: {
          title: "E-commerce API",
          version: "0.1.0",
        },
        tags: [
          { name: "General", description: "Rotas gerais" },
          { name: "Checkout", description: "Stripe checkout" },
          { name: "Cart", description: "Shopping cart management" },
        ],
      },
    }),
  )
  .get(
    "/",
    () => ({
      message: "Elysia on Next.js",
      docs: "OpenAPI em /api/openapi e JSON em /api/openapi/json.",
    }),
    {
      detail: {
        summary: "Raiz da API",
        tags: ["General"],
      },
    },
  )
  .post("/echo", ({ body }) => body, {
    body: echoBodySchema,
    detail: {
      summary: "Ecoa o corpo JSON",
      tags: ["General"],
    },
  })
  .use(authModule)
  .use(checkoutModule)
  .use(healthModule)
  .use(categoriesModule)
  .use(productsModule)
  .use(cartModule);

export type ApiApp = typeof apiApp;
