import { apiApp } from "@/server/elysia-app";

export const runtime = "nodejs";

export const GET = apiApp.fetch;
export const POST = apiApp.fetch;
export const PUT = apiApp.fetch;
export const PATCH = apiApp.fetch;
export const DELETE = apiApp.fetch;
export const HEAD = apiApp.fetch;
