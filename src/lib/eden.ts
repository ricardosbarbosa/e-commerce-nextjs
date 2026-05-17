import { treaty } from "@elysia/eden";
import type { ApiApp } from "@/server/elysia-app";

export const api = treaty<ApiApp>(
  process.env.NEXT_PUBLIC_APP_URL ?? "localhost:3000",
).api;
