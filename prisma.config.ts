// ============================================================
//  Prisma Configuration — Prisma v7+
//  Centralises datasource URL, migration path, and schema location.
//  Replaces the deprecated `url = env("DATABASE_URL")` in schema.prisma.
// ============================================================

import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  // Path to the Prisma schema file
  schema: "prisma/schema.prisma",

  // Migration output directory
  migrations: {
    path: "prisma/migrations",
  },

  // Database connection — reads from .env
  datasource: {
    url: process.env.DATABASE_URL!,
  },

  // Seed command — run with: npx prisma db seed
  seed: "npx ts-node-dev --transpile-only prisma/seed.ts",
});
