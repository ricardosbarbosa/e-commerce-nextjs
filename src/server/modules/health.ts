import { Elysia } from "elysia";

export const healthModule = new Elysia({ name: "health" }).get(
  "/health",
  () => ({
    ok: true as const,
    service: "api",
  }),
  {
    detail: {
      summary: "Health check",
      tags: ["General"],
    },
  },
);
