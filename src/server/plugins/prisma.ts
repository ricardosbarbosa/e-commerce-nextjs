import { prisma } from "@/lib/prisma";
import { Elysia } from "elysia";

/** Injects `prisma` into route context (same singleton as Better Auth). */
export const prismaPlugin = new Elysia({ name: "prisma" }).decorate(
  "prisma",
  prisma,
);
