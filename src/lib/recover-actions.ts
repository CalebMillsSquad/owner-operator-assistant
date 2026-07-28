import { restoreSoftDeletedRecord, type AuditLogInput } from "./recovery.ts";

export type RestoreOperationInput<Record extends { id: string; deletedAt: Date | null }> = {
  id: string;
  entityType: string;
  notFoundMessage: string;
  notDeletedMessage: string;
  findRecord: (id: string) => Promise<Record | null>;
  restoreRecord: (id: string) => Promise<unknown>;
  createAuditLog: (input: AuditLogInput) => Promise<unknown>;
  details: (record: Record) => string;
};

export type RestoreResult = {
  status: "ok" | "error";
  message?: string;
};

export function getRestoreErrorMessage(error: unknown, notFoundMessage: string, notDeletedMessage: string) {
  if (!(error instanceof Error)) {
    return "Restore failed. Please try again.";
  }

  if (error.message.includes(notFoundMessage)) {
    return notFoundMessage;
  }

  if (error.message.includes(notDeletedMessage)) {
    return notDeletedMessage;
  }

  return "Restore failed. Please try again.";
}

export async function runRestoreWithUserFeedback<Record extends { id: string; deletedAt: Date | null }>(
  input: RestoreOperationInput<Record>,
): Promise<RestoreResult> {
  try {
    await restoreSoftDeletedRecord(input);
    return { status: "ok" };
  } catch (error) {
    return { status: "error", message: getRestoreErrorMessage(error, input.notFoundMessage, input.notDeletedMessage) };
  }
}
