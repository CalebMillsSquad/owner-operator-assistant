import assert from "node:assert/strict";
import test from "node:test";

import { cleanupExpiredSoftDeletes, getRetentionCutoff } from "./retention.ts";

const targetKeys = [
  "load",
  "fuelLog",
  "expense",
  "documentAlert",
  "maintenanceItem",
  "inspectionChecklist",
  "loadOpportunity",
  "marketSignal",
  "brokerContact",
  "shipperLead",
  "smartFuelStop",
] as const;

function createMockClient(counts: Partial<Record<(typeof targetKeys)[number], number>>) {
  const calls: string[] = [];
  const auditLogs: unknown[] = [];
  const client = Object.fromEntries(
    targetKeys.map((key) => [
      key,
      {
        count: async () => {
          calls.push(`${key}:count`);
          return counts[key] ?? 0;
        },
        deleteMany: async () => {
          calls.push(`${key}:deleteMany`);
          return { count: counts[key] ?? 0 };
        },
      },
    ]),
  ) as Record<(typeof targetKeys)[number], { count: () => Promise<number>; deleteMany: () => Promise<{ count: number }> }>;

  return {
    calls,
    auditLogs,
    client: {
      ...client,
      auditLog: {
        create: async (input: unknown) => {
          auditLogs.push(input);
        },
      },
    },
  };
}

test("calculates the default 24-month retention cutoff", () => {
  assert.equal(getRetentionCutoff(new Date("2026-06-27T12:00:00.000Z")).toISOString(), "2024-06-27T12:00:00.000Z");
});

test("dry-runs expired soft-delete cleanup without deleting or writing audit log", async () => {
  const harness = createMockClient({ load: 2, expense: 1, smartFuelStop: 3 });
  const result = await cleanupExpiredSoftDeletes(harness.client, {
    asOf: new Date("2026-06-27T12:00:00.000Z"),
  });

  assert.equal(result.mode, "dry-run");
  assert.equal(result.retentionMonths, 24);
  assert.equal(result.cutoff.toISOString(), "2024-06-27T12:00:00.000Z");
  assert.equal(result.total, 6);
  assert.equal(harness.calls.every((call) => call.endsWith(":count")), true);
  assert.equal(harness.auditLogs.length, 0);
});

test("executes expired soft-delete cleanup and writes one retained audit summary", async () => {
  const harness = createMockClient({ load: 2, expense: 1 });
  const result = await cleanupExpiredSoftDeletes(harness.client, {
    asOf: new Date("2026-06-27T12:00:00.000Z"),
    execute: true,
    actor: "Owner Operator (local-operator)",
  });

  assert.equal(result.mode, "execute");
  assert.equal(result.total, 3);
  assert.equal(harness.calls.every((call) => call.endsWith(":deleteMany")), true);
  assert.equal(harness.auditLogs.length, 1);
  assert.match(JSON.stringify(harness.auditLogs[0]), /RETENTION_CLEANUP/);
  assert.match(JSON.stringify(harness.auditLogs[0]), /Load=2/);
  assert.match(JSON.stringify(harness.auditLogs[0]), /Expense=1/);
});
