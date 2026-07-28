import assert from "node:assert/strict";
import test from "node:test";

import { scopePilotPrismaArgs } from "./pilot-scope.ts";

test("adds the pilot workspace to private reads and targeted mutations", () => {
  assert.deepEqual(scopePilotPrismaArgs("findMany", { where: { deletedAt: null } }, "mills-pilot"), { where: { deletedAt: null, workspaceId: "mills-pilot" } });
  assert.deepEqual(scopePilotPrismaArgs("update", { where: { id: "record-1" }, data: { notes: "updated" } }, "mills-pilot"), { where: { id: "record-1", workspaceId: "mills-pilot" }, data: { notes: "updated" } });
});

test("overrides caller-supplied workspace ids on creates and upserts", () => {
  assert.deepEqual(scopePilotPrismaArgs("create", { data: { workspaceId: "other", title: "Test" } }, "mills-pilot"), { data: { workspaceId: "mills-pilot", title: "Test" } });
  assert.deepEqual(scopePilotPrismaArgs("upsert", { where: { id: "x" }, create: { workspaceId: "other" }, update: { workspaceId: "other" } }, "mills-pilot"), { where: { id: "x", workspaceId: "mills-pilot" }, create: { workspaceId: "mills-pilot" }, update: { workspaceId: "mills-pilot" } });
});

test("refuses to execute without a workspace scope", () => {
  assert.throws(() => scopePilotPrismaArgs("findMany", {}, ""), /workspace scope is required/);
});
