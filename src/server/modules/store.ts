import { prismaPlugin } from "@/server/plugins/prisma";
import { Elysia } from "elysia";

export const storeModule = new Elysia({ name: "store" }).use(prismaPlugin).get(
  "/store/categories",
  ({ prisma }) => {
    return prisma.category.findMany();
  },
  {
    detail: {
      summary: "Get categories",
      tags: ["Store"],
    },
  },
);
