export type PilotPrismaArgs = {
  where?: Record<string, unknown>;
  data?: Record<string, unknown> | Record<string, unknown>[];
  create?: Record<string, unknown>;
  update?: Record<string, unknown>;
};

const scopedTargetOperations = new Set([
  "findUnique", "findUniqueOrThrow", "findFirst", "findFirstOrThrow", "findMany", "count", "aggregate", "groupBy",
  "update", "updateMany", "delete", "deleteMany", "upsert",
]);

export function scopePilotPrismaArgs(operation: string, args: PilotPrismaArgs, workspaceId: string) {
  if (!workspaceId) throw new Error("Pilot workspace scope is required.");
  const scoped: PilotPrismaArgs = { ...args };
  if (scopedTargetOperations.has(operation)) scoped.where = { ...args.where, workspaceId };
  if (operation === "create" || operation === "createMany" || operation === "createManyAndReturn") {
    scoped.data = Array.isArray(args.data)
      ? args.data.map((item) => ({ ...item, workspaceId }))
      : { ...args.data, workspaceId };
  }
  if (operation === "upsert") {
    scoped.create = { ...args.create, workspaceId };
    scoped.update = { ...args.update, workspaceId };
  }
  return scoped;
}
