export const restoreAuditMetadata = {
  actor: "system",
  action: "RESTORE",
  reason: "Manual restore from UI",
};

export type AuditLogInput = {
  entityType: string;
  entityId: string;
  action?: string;
  actor?: string | null;
  reason?: string | null;
  details: string;
};

type RestorableRecord = {
  id: string;
  deletedAt: Date | null;
};

type RestoreSoftDeletedRecordInput<Record extends RestorableRecord> = {
  id: string;
  entityType: string;
  notFoundMessage: string;
  notDeletedMessage: string;
  findRecord: (id: string) => Promise<Record | null>;
  restoreRecord: (id: string) => Promise<unknown>;
  createAuditLog: (input: AuditLogInput) => Promise<unknown>;
  details: (record: Record) => string;
};

export async function restoreSoftDeletedRecord<Record extends RestorableRecord>({
  id,
  entityType,
  notFoundMessage,
  notDeletedMessage,
  findRecord,
  restoreRecord,
  createAuditLog,
  details,
}: RestoreSoftDeletedRecordInput<Record>) {
  const record = await findRecord(id);
  if (!record) {
    throw new Error(notFoundMessage);
  }

  if (!record.deletedAt) {
    throw new Error(notDeletedMessage);
  }

  await restoreRecord(id);
  await createAuditLog({
    ...restoreAuditMetadata,
    entityType,
    entityId: record.id,
    details: details(record),
  });

  return record;
}
