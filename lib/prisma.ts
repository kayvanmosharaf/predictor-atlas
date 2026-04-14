import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { execSync } from "child_process";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient;
  migrated?: boolean;
};

function runMigrations() {
  if (globalForPrisma.migrated) return;
  try {
    execSync("npx prisma migrate deploy", { stdio: "inherit" });
    console.log("Prisma migrations applied successfully");
  } catch (e) {
    console.error("Prisma migrate deploy failed:", e);
  }
  globalForPrisma.migrated = true;
}

function createPrismaClient() {
  if (process.env.NODE_ENV === "production") {
    runMigrations();
  }
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
