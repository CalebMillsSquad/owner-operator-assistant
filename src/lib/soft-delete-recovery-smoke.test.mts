import assert from "node:assert/strict";
import test from "node:test";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { resolve } from "node:path";
import { mkdir, readdir, readFile, rm } from "node:fs/promises";
import { homedir } from "node:os";

import { prisma } from "./prisma.ts";
import { restoreAuditMetadata, restoreSoftDeletedRecord } from "./recovery.ts";

const execFileAsync = promisify(execFile);

const SOFT_DELETE_AUDIT = {
  actor: "system",
  action: "SOFT_DELETE",
  reason: "Manual deletion from UI",
};

const databaseFilename = (process.env.OWNER_OPERATOR_DATABASE_URL ?? "file:./dev.db").replace(/^file:\.\//, "");
const DATABASE_FILES = [databaseFilename, `${databaseFilename}-wal`, `${databaseFilename}-shm`, `${databaseFilename}-journal`];
const PRISMA_STATE_DIR = resolve(process.env.APPDATA ?? resolve(homedir(), "AppData", "Roaming"), "prisma-nodejs");

async function refreshSeededDatabase() {
  const root = process.cwd();

  await prisma.$disconnect();

  let databaseRemoved = false;
  for (const filename of DATABASE_FILES) {
    const filePath = resolve(root, filename);
    try {
      await rm(filePath, { force: true });
      if (filename === databaseFilename) {
        databaseRemoved = true;
      }
    } catch (error) {
      if (filename === databaseFilename && error instanceof Error && "code" in error && (error as NodeJS.ErrnoException).code === "EBUSY") {
        databaseRemoved = false;
      } else {
        throw error;
      }
    }
  }

  if (!databaseRemoved) {
    await prisma.auditLog.deleteMany();
    await prisma.inspectionItem.deleteMany();
    await prisma.inspectionChecklist.deleteMany();
    await prisma.loadOpportunity.deleteMany();
    await prisma.marketSignal.deleteMany();
    await prisma.brokerContact.deleteMany();
    await prisma.shipperLead.deleteMany();
    await prisma.smartFuelStop.deleteMany();
    await prisma.expense.deleteMany();
    await prisma.documentAlert.deleteMany();
    await prisma.maintenanceItem.deleteMany();
    await prisma.load.deleteMany();
    await prisma.fuelLog.deleteMany();
  }

  await mkdir(PRISMA_STATE_DIR, { recursive: true });
  const migrateCommand = [resolve(root, "node_modules", "prisma", "build", "index.js"), "migrate", "deploy"];
  try {
    await execFileAsync("node", migrateCommand, { cwd: root });
  } catch {
    const migrationRoot = resolve(root, "prisma", "migrations");
    const migrationFolders = await readdir(migrationRoot, { withFileTypes: true });
    const ordered = migrationFolders
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort()
      .map((name) => resolve(migrationRoot, name, "migration.sql"));

    for (const filePath of ordered) {
      const sql = await readFile(filePath, "utf8");
      const statements = sql
        .split(/;\s*(\r?\n|$)/)
        .map((statement) => statement.trim())
        .filter(Boolean);

      for (const statement of statements) {
        await prisma.$executeRawUnsafe(statement);
      }
    }
  }
  await execFileAsync("node", ["prisma/seed.mjs"], { cwd: root });
}

function formatDate(date: Date) {
  return date.toISOString();
}

test("restores soft-deleted core Load and Load Opportunity with audit entries on a fresh seeded DB", async () => {
  const loadId = "smoke-load-core";
  const opportunityId = "smoke-opportunity-la";
  const deletedAtLoad = new Date("2026-06-25T12:00:00.000Z");
  const deletedAtOpportunity = new Date("2026-06-25T12:30:00.000Z");

  await refreshSeededDatabase();

  const seededFuel = await prisma.fuelLog.findUnique({
    where: { id: "seed-fuel-memphis-dallas" },
    include: { expense: true },
  });
  assert.ok(seededFuel);
  const linkedFuelExpense = seededFuel.expense;
  assert.ok(linkedFuelExpense);
  assert.equal(linkedFuelExpense.category, "FUEL");
  assert.equal(linkedFuelExpense.amount, seededFuel.totalCost);

  const fuelDeletedAt = new Date("2026-06-25T11:30:00.000Z");
  await prisma.$transaction([
    prisma.fuelLog.update({ where: { id: seededFuel.id }, data: { deletedAt: fuelDeletedAt } }),
    prisma.expense.update({ where: { id: linkedFuelExpense.id }, data: { deletedAt: fuelDeletedAt } }),
  ]);
  await restoreSoftDeletedRecord({
    id: seededFuel.id,
    entityType: "FuelLog",
    notFoundMessage: "Fuel purchase not found.",
    notDeletedMessage: "Fuel purchase is not deleted.",
    findRecord: (recordId) =>
      prisma.fuelLog.findUnique({
        where: { id: recordId },
        select: { id: true, vendor: true, expenseId: true, deletedAt: true },
      }),
    restoreRecord: async (recordId) => {
      await prisma.$transaction([
        prisma.fuelLog.update({ where: { id: recordId }, data: { deletedAt: null } }),
        prisma.expense.update({ where: { id: linkedFuelExpense.id }, data: { deletedAt: null } }),
      ]);
    },
    createAuditLog: async (input) => {
      await prisma.auditLog.create({
        data: {
          ...input,
          action: input.action ?? restoreAuditMetadata.action,
        },
      });
    },
    details: (fuelLog) => `Fuel purchase ${fuelLog.vendor ?? "Unknown vendor"} restored.`,
  });

  const restoredFuel = await prisma.fuelLog.findUnique({
    where: { id: seededFuel.id },
    include: { expense: true },
  });
  assert.equal(restoredFuel?.deletedAt, null);
  assert.equal(restoredFuel?.expense?.deletedAt, null);

  const load = await prisma.load.create({
    data: {
      id: loadId,
      origin: "Test Origin",
      destination: "Test Destination",
      status: "BOOKED",
    },
  });

  const opportunity = await prisma.loadOpportunity.create({
    data: {
      id: opportunityId,
      sourceType: "BROKER",
      sourceName: "Smoke Test Source",
      origin: "Test Origin",
      destination: "Test Destination",
      status: "NEW",
      priority: "MEDIUM",
    },
  });

  await prisma.load.update({
    where: { id: load.id },
    data: { deletedAt: deletedAtLoad },
  });
  await prisma.auditLog.create({
    data: {
      entityType: "Load",
      entityId: load.id,
      action: SOFT_DELETE_AUDIT.action,
      actor: SOFT_DELETE_AUDIT.actor,
      reason: SOFT_DELETE_AUDIT.reason,
      details: `Load ${load.origin} to ${load.destination} (deletedAt=${formatDate(deletedAtLoad)})`,
    },
  });

  await prisma.loadOpportunity.update({
    where: { id: opportunity.id },
    data: { deletedAt: deletedAtOpportunity },
  });
  await prisma.auditLog.create({
    data: {
      entityType: "LoadOpportunity",
      entityId: opportunity.id,
      action: SOFT_DELETE_AUDIT.action,
      actor: SOFT_DELETE_AUDIT.actor,
      reason: SOFT_DELETE_AUDIT.reason,
      details: `Load opportunity ${opportunity.sourceName} (deletedAt=${formatDate(deletedAtOpportunity)})`,
    },
  });

  try {
    await restoreSoftDeletedRecord({
      id: load.id,
      entityType: "Load",
      notFoundMessage: "Load not found.",
      notDeletedMessage: "Load is not deleted.",
      findRecord: (recordId) => prisma.load.findUnique({ where: { id: recordId }, select: { id: true, origin: true, destination: true, deletedAt: true } }),
      restoreRecord: (recordId) => prisma.load.update({ where: { id: recordId }, data: { deletedAt: null } }),
      createAuditLog: async (input) => {
        await prisma.auditLog.create({
          data: {
            ...input,
            action: input.action ?? restoreAuditMetadata.action,
          },
        });
      },
      details: (record) => `Load ${record.origin} to ${record.destination} restored.`,
    });

    await restoreSoftDeletedRecord({
      id: opportunity.id,
      entityType: "LoadOpportunity",
      notFoundMessage: "Load opportunity not found.",
      notDeletedMessage: "Load opportunity is not deleted.",
      findRecord: (recordId) =>
        prisma.loadOpportunity.findUnique({
          where: { id: recordId },
          select: { id: true, origin: true, destination: true, deletedAt: true },
        }),
      restoreRecord: (recordId) =>
        prisma.loadOpportunity.update({ where: { id: recordId }, data: { deletedAt: null } }),
      createAuditLog: async (input) => {
        await prisma.auditLog.create({
          data: {
            ...input,
            action: input.action ?? restoreAuditMetadata.action,
          },
        });
      },
      details: (item) => `Load opportunity ${item.origin} to ${item.destination} restored.`,
    });

    const refreshedLoad = await prisma.load.findUnique({
      where: { id: load.id },
      select: { deletedAt: true, origin: true, destination: true },
    });
    const refreshedOpportunity = await prisma.loadOpportunity.findUnique({
      where: { id: opportunity.id },
      select: { deletedAt: true, sourceName: true, sourceType: true, destination: true, origin: true },
    });

    assert.equal(refreshedLoad?.deletedAt, null);
    assert.equal(refreshedOpportunity?.deletedAt, null);

    const loadRestoreAudit = await prisma.auditLog.findFirst({
      where: { entityType: "Load", entityId: load.id, action: "RESTORE" },
      orderBy: { createdAt: "desc" },
    });
    const opportunityRestoreAudit = await prisma.auditLog.findFirst({
      where: { entityType: "LoadOpportunity", entityId: opportunity.id, action: "RESTORE" },
      orderBy: { createdAt: "desc" },
    });

    assert.ok(loadRestoreAudit);
    assert.ok(opportunityRestoreAudit);
    assert.equal(loadRestoreAudit?.actor, restoreAuditMetadata.actor);
    assert.equal(loadRestoreAudit?.reason, restoreAuditMetadata.reason);
    assert.equal(opportunityRestoreAudit?.actor, restoreAuditMetadata.actor);
    assert.equal(opportunityRestoreAudit?.reason, restoreAuditMetadata.reason);

    assert.equal(loadRestoreAudit?.details, `Load ${load.origin} to ${load.destination} restored.`);
    assert.equal(
      opportunityRestoreAudit?.details,
      `Load opportunity ${opportunity.origin} to ${opportunity.destination} restored.`,
    );

    const softDeleteAudits = await prisma.auditLog.findMany({
      where: { action: "SOFT_DELETE", entityId: { in: [load.id, opportunity.id] } },
    });
    const restoreAudits = await prisma.auditLog.findMany({
      where: { action: "RESTORE", entityId: { in: [load.id, opportunity.id] } },
    });

    assert.equal(softDeleteAudits.length, 2);
    assert.equal(restoreAudits.length, 2);
  } finally {
    await prisma.auditLog.deleteMany({
      where: { entityId: { in: [load.id, opportunity.id] } },
    });
    await prisma.load.delete({ where: { id: load.id } });
    await prisma.loadOpportunity.delete({ where: { id: opportunity.id } });
  }
});
