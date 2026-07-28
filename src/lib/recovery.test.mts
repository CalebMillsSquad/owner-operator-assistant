import assert from "node:assert/strict";
import test from "node:test";

import { getRestoreErrorMessage, runRestoreWithUserFeedback, type RestoreOperationInput } from "../lib/recover-actions.ts";
import { restoreAuditMetadata, restoreSoftDeletedRecord, type AuditLogInput } from "./recovery.ts";

type TestRecord = {
  id: string;
  deletedAt: Date | null;
  label: string;
};

function createRestoreHarness(record: TestRecord) {
  const auditLogs: AuditLogInput[] = [];

  return {
    auditLogs,
    record,
    restore: (entityType: string, notDeletedMessage: string) =>
      restoreSoftDeletedRecord({
        id: record.id,
        entityType,
        notFoundMessage: `${entityType} not found.`,
        notDeletedMessage,
        findRecord: async (id) => (id === record.id ? record : null),
        restoreRecord: async () => {
          record.deletedAt = null;
        },
        createAuditLog: async (input) => {
          auditLogs.push(input);
        },
        details: (item) => `${entityType} ${item.label} restored.`,
      }),
  };
}

test("restores a deleted core Load and writes one restore audit entry", async () => {
  const harness = createRestoreHarness({
    id: "load-restore-test",
    deletedAt: new Date("2026-06-25T12:00:00.000Z"),
    label: "Memphis to Dallas",
  });

  await harness.restore("Load", "Load is not deleted.");

  assert.equal(harness.record.deletedAt, null);
  assert.deepEqual(harness.auditLogs, [
    {
      ...restoreAuditMetadata,
      entityType: "Load",
      entityId: "load-restore-test",
      details: "Load Memphis to Dallas restored.",
    },
  ]);
});

test("prevents duplicate core Load restore audit entries", async () => {
  const harness = createRestoreHarness({
    id: "load-duplicate-restore-test",
    deletedAt: new Date("2026-06-25T12:00:00.000Z"),
    label: "Memphis to Dallas",
  });

  await harness.restore("Load", "Load is not deleted.");
  await assert.rejects(() => harness.restore("Load", "Load is not deleted."), /Load is not deleted\./);

  assert.equal(harness.record.deletedAt, null);
  assert.equal(harness.auditLogs.length, 1);
});

test("restores a deleted Load Acquisition opportunity and writes one restore audit entry", async () => {
  const harness = createRestoreHarness({
    id: "opportunity-restore-test",
    deletedAt: new Date("2026-06-25T12:00:00.000Z"),
    label: "Memphis to Dallas",
  });

  await harness.restore("LoadOpportunity", "Load opportunity is not deleted.");

  assert.equal(harness.record.deletedAt, null);
  assert.deepEqual(harness.auditLogs, [
    {
      ...restoreAuditMetadata,
      entityType: "LoadOpportunity",
      entityId: "opportunity-restore-test",
      details: "LoadOpportunity Memphis to Dallas restored.",
    },
  ]);
});

test("prevents duplicate Load Acquisition restore audit entries", async () => {
  const harness = createRestoreHarness({
    id: "opportunity-duplicate-restore-test",
    deletedAt: new Date("2026-06-25T12:00:00.000Z"),
    label: "Memphis to Dallas",
  });

  await harness.restore("LoadOpportunity", "Load opportunity is not deleted.");
  await assert.rejects(
    () => harness.restore("LoadOpportunity", "Load opportunity is not deleted."),
    /Load opportunity is not deleted\./,
  );

  assert.equal(harness.record.deletedAt, null);
  assert.equal(harness.auditLogs.length, 1);
});

test("maps duplicate restore failures to friendly action messages", async () => {
  const result = await runRestoreWithUserFeedback({
    id: "load-duplicate-message-test",
    entityType: "Load",
    notFoundMessage: "Load not found.",
    notDeletedMessage: "Load is not deleted.",
    findRecord: async (recordId) =>
      recordId === "load-duplicate-message-test" ? { id: recordId, deletedAt: null, label: "Memphis to Dallas" } : null,
    restoreRecord: async () => {
      throw new Error("Load is not deleted.");
    },
    createAuditLog: async () => {
      throw new Error("unused");
    },
    details: (item) => `Load ${item.label} restored.`,
  } satisfies RestoreOperationInput<{ id: string; deletedAt: Date | null; label: string }>);

  assert.equal(result.status, "error");
  assert.equal(result.message, "Load is not deleted.");
});

test("maps missing restore records to friendly action messages", async () => {
  const result = await runRestoreWithUserFeedback({
    id: "load-missing-message-test",
    entityType: "Load",
    notFoundMessage: "Load not found.",
    notDeletedMessage: "Load is not deleted.",
    findRecord: async () => null,
    restoreRecord: async () => {
      throw new Error("Unexpected restore attempt.");
    },
    createAuditLog: async () => {
      throw new Error("unused");
    },
    details: (item) => `Load ${item.label} restored.`,
  } satisfies RestoreOperationInput<{ id: string; deletedAt: Date | null; label: string }>);

  assert.equal(result.status, "error");
  assert.equal(result.message, "Load not found.");
});

test("maps unknown restore failures to a generic user-safe message", async () => {
  const result = await runRestoreWithUserFeedback({
    id: "load-unknown-message-test",
    entityType: "Load",
    notFoundMessage: "Load not found.",
    notDeletedMessage: "Load is not deleted.",
    findRecord: async (recordId) =>
      recordId === "load-unknown-message-test" ? { id: recordId, deletedAt: new Date("2026-06-25T12:00:00.000Z"), label: "Memphis to Dallas" } : null,
    restoreRecord: async () => {
      throw new Error("Transient database failure during restore.");
    },
    createAuditLog: async () => {
      throw new Error("unused");
    },
    details: (item) => `Load ${item.label} restored.`,
  } satisfies RestoreOperationInput<{ id: string; deletedAt: Date | null; label: string }>);

  assert.equal(result.status, "error");
  assert.equal(result.message, "Restore failed. Please try again.");
});

test("maps unknown non-error failures to a generic user-safe message", async () => {
  const result = getRestoreErrorMessage({ code: "E_UNKNOWN" }, "Load not found.", "Load is not deleted.");

  assert.equal(result, "Restore failed. Please try again.");
});
