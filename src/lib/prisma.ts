import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../generated/prisma/client";

/** Matches `docker-compose.yml` when `DATABASE_URL` is unset. */
const defaultDatabaseUrl = "postgresql://app:app@127.0.0.1:5433/ecommerce";

const globalForDb = globalThis as unknown as {
  prismaPool: Pool | undefined;
  prisma: PrismaClient | undefined;
};

function getPool(): Pool {
  if (!globalForDb.prismaPool) {
    globalForDb.prismaPool = new Pool({
      connectionString: process.env.DATABASE_URL ?? defaultDatabaseUrl,
    });
  }
  return globalForDb.prismaPool;
}

export const prisma =
  globalForDb.prisma ??
  new PrismaClient({
    adapter: new PrismaPg(getPool()),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.prisma = prisma;
}
