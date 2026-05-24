import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../generated/prisma/client";

/** Matches `docker-compose.yml` when `DATABASE_URL` is unset. */
const defaultDatabaseUrl = "postgresql://app:app@127.0.0.1:5433/ecommerce";
const databaseUrl =
  process.env.DATABASE_POSTGRES_URL ??
  process.env.DATABASE_URL ??
  defaultDatabaseUrl;

const globalForDb = globalThis as unknown as {
  prismaPool: Pool | undefined;
  prisma: PrismaClient | undefined;
};

function getPoolMax(): number {
  const fallback = process.env.NODE_ENV === "production" ? 1 : 10;
  const value = Number.parseInt(
    process.env.DATABASE_POOL_MAX ?? String(fallback),
    10,
  );

  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function getPool(): Pool {
  if (!globalForDb.prismaPool) {
    globalForDb.prismaPool = new Pool({
      connectionString: databaseUrl,
      max: getPoolMax(),
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
