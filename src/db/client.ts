import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

// ──────────────────────────────────────────────
//  Singleton Prisma Client — Prisma v7
// ──────────────────────────────────────────────
//  Prisma 7 requires an explicit driver adapter instead of
//  reading the connection URL from schema.prisma.
//
//  In development ts-node-dev restarts the process on every
//  file change, which can exhaust the connection pool if a new
//  PrismaClient is created each time.  Caching the instance on
//  `globalThis` prevents this.
// ──────────────────────────────────────────────

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "info", "warn", "error"]
        : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
