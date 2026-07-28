import { prisma } from "./prisma.ts";
import { cleanupExpiredSoftDeletes, defaultRetentionMonths } from "./retention.ts";

function getArgValue(name: string) {
  const prefix = `${name}=`;
  const value = process.argv.find((arg) => arg.startsWith(prefix));
  return value ? value.slice(prefix.length) : undefined;
}

function parseRetentionMonths() {
  const value = getArgValue("--months");
  if (!value) {
    return defaultRetentionMonths;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error("--months must be a positive whole number.");
  }

  return parsed;
}

function parseAsOf() {
  const value = getArgValue("--as-of");
  if (!value) {
    return new Date();
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("--as-of must be a valid date.");
  }

  return parsed;
}

async function main() {
  const execute = process.argv.includes("--execute");
  const result = await cleanupExpiredSoftDeletes(prisma, {
    execute,
    retentionMonths: parseRetentionMonths(),
    asOf: parseAsOf(),
    actor: process.env.OWNER_OPERATOR_NAME?.trim() || "retention-cleanup",
  });

  console.log(JSON.stringify(result, null, 2));

  if (!execute) {
    console.log("Dry run only. Re-run with --execute during an approved maintenance window to delete expired records.");
  }
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

