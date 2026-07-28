export const defaultRetentionMonths = 24;

const retentionTargets = [
  { entityType: "Load", clientKey: "load" },
  { entityType: "FuelLog", clientKey: "fuelLog" },
  { entityType: "Expense", clientKey: "expense" },
  { entityType: "DocumentAlert", clientKey: "documentAlert" },
  { entityType: "MaintenanceItem", clientKey: "maintenanceItem" },
  { entityType: "InspectionChecklist", clientKey: "inspectionChecklist" },
  { entityType: "LoadOpportunity", clientKey: "loadOpportunity" },
  { entityType: "MarketSignal", clientKey: "marketSignal" },
  { entityType: "BrokerContact", clientKey: "brokerContact" },
  { entityType: "ShipperLead", clientKey: "shipperLead" },
  { entityType: "SmartFuelStop", clientKey: "smartFuelStop" },
] as const;

type RetentionTarget = (typeof retentionTargets)[number];

type CleanupDelegate = {
  count: (args: { where: { deletedAt: { lt: Date } } }) => Promise<number>;
  deleteMany: (args: { where: { deletedAt: { lt: Date } } }) => Promise<{ count: number }>;
};

type CleanupClient = {
  [key in RetentionTarget["clientKey"]]: CleanupDelegate;
} & {
  auditLog: {
    create: (args: {
      data: {
        entityType: string;
        entityId: string;
        action: string;
        actor: string;
        reason: string;
        details: string;
      };
    }) => Promise<unknown>;
  };
};

export type RetentionCleanupOptions = {
  asOf?: Date;
  retentionMonths?: number;
  execute?: boolean;
  actor?: string;
};

export type RetentionCleanupResult = {
  mode: "dry-run" | "execute";
  cutoff: Date;
  retentionMonths: number;
  total: number;
  targets: Array<{
    entityType: string;
    count: number;
  }>;
};

export function getRetentionCutoff(asOf = new Date(), retentionMonths = defaultRetentionMonths) {
  if (!Number.isInteger(retentionMonths) || retentionMonths < 1) {
    throw new Error("Retention months must be a positive whole number.");
  }

  const cutoff = new Date(asOf);
  cutoff.setMonth(cutoff.getMonth() - retentionMonths);
  return cutoff;
}

export async function cleanupExpiredSoftDeletes(
  client: CleanupClient,
  { asOf = new Date(), retentionMonths = defaultRetentionMonths, execute = false, actor = "retention-cleanup" }: RetentionCleanupOptions = {},
): Promise<RetentionCleanupResult> {
  const cutoff = getRetentionCutoff(asOf, retentionMonths);
  const targets: RetentionCleanupResult["targets"] = [];

  for (const target of retentionTargets) {
    const where = { deletedAt: { lt: cutoff } };
    const count = execute
      ? (await client[target.clientKey].deleteMany({ where })).count
      : await client[target.clientKey].count({ where });

    targets.push({ entityType: target.entityType, count });
  }

  const total = targets.reduce((sum, target) => sum + target.count, 0);

  if (execute) {
    await client.auditLog.create({
      data: {
        entityType: "RetentionCleanup",
        entityId: cutoff.toISOString(),
        action: "RETENTION_CLEANUP",
        actor,
        reason: `Soft-delete retention cleanup after ${retentionMonths} months`,
        details: `Deleted ${total} expired soft-deleted operational records. Counts: ${targets
          .map((target) => `${target.entityType}=${target.count}`)
          .join(", ")}`,
      },
    });
  }

  return {
    mode: execute ? "execute" : "dry-run",
    cutoff,
    retentionMonths,
    total,
    targets,
  };
}
