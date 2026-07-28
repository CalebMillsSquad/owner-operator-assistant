import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { PrismaClient as PilotPrismaClient } from "../generated/pilot-prisma/index.js";
import { scopePilotPrismaArgs } from "./pilot-scope.ts";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };
const databaseUrl = process.env.OWNER_OPERATOR_DATABASE_URL ?? "file:./dev.db";
const pilotMode = process.env.PILOT_MODE === "true";
const localPilotTestMode = pilotMode && process.env.PILOT_LOCAL_TEST_MODE === "true" && process.env.NODE_ENV !== "production";

if (pilotMode && !localPilotTestMode && !process.env.DATABASE_URL?.startsWith("postgres")) {
  throw new Error("PILOT_MODE requires a separate PostgreSQL DATABASE_URL.");
}

function addPilotScope(client: PilotPrismaClient) {
    const workspaceId = process.env.PILOT_WORKSPACE_ID?.trim() || "mills-trucking-pilot";
    const scoped = client.$extends({
      query: {
        $allModels: {
          async $allOperations({ operation, args, query }) {
            return query(scopePilotPrismaArgs(operation, args, workspaceId) as typeof args);
          },
        },
      },
    });
    return scoped as unknown as PrismaClient;
}

function createClient() {
  if (pilotMode && !localPilotTestMode) {
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
    return addPilotScope(new PilotPrismaClient({ adapter, log: ["error"] }));
  }

  const adapter = new PrismaBetterSqlite3({ url: databaseUrl });
  const client = new PrismaClient({ adapter, log: ["error"] });
  return pilotMode ? addPilotScope(client as unknown as PilotPrismaClient) : client;
}

export const prisma =
  globalForPrisma.prisma ??
  createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
