import assert from "node:assert/strict";
import test from "node:test";

import {
  assertOperatorRole,
  decodeOperatorSession,
  defaultLocalOperator,
  encodeOperatorSession,
  formatActor,
  getConfiguredOperator,
  getConfiguredPassword,
  getSessionSecret,
  isAuthEnvironmentConfigured,
  type OperatorSession,
  verifyOperatorPassword,
} from "./auth-core.ts";

test("reads owner auth password before legacy operator password fallback", () => {
  assert.equal(
    getConfiguredPassword({
      OWNER_OPERATOR_AUTH_PASSWORD: "owner-password",
      OPERATOR_AUTH_PASSWORD: "operator-password",
    }),
    "owner-password",
  );

  assert.equal(getConfiguredPassword({ OPERATOR_AUTH_PASSWORD: "operator-password" }), "operator-password");
  assert.equal(getConfiguredPassword({}), "");
});

test("uses explicit session secret before falling back to the configured password", () => {
  assert.equal(
    getSessionSecret({
      OWNER_OPERATOR_AUTH_PASSWORD: "owner-password",
      OWNER_OPERATOR_SESSION_SECRET: "owner-secret",
    }),
    "owner-secret",
  );

  assert.equal(getSessionSecret({ OWNER_OPERATOR_AUTH_PASSWORD: "owner-password" }), "owner-password");
});

test("reports auth environment readiness only when password and session secret resolve", () => {
  assert.equal(isAuthEnvironmentConfigured({}), false);
  assert.equal(isAuthEnvironmentConfigured({ OWNER_OPERATOR_AUTH_PASSWORD: "owner-password" }), true);
  assert.equal(
    isAuthEnvironmentConfigured({
      OWNER_OPERATOR_AUTH_PASSWORD: "owner-password",
      OWNER_OPERATOR_SESSION_SECRET: "owner-secret",
    }),
    true,
  );
});

test("builds configured operator identity with safe defaults and explicit operator role", () => {
  assert.deepEqual(getConfiguredOperator({}), defaultLocalOperator);
  assert.deepEqual(getConfiguredOperator({ OWNER_OPERATOR_ID: "owner-1", OWNER_OPERATOR_NAME: "Owner One" }), {
    id: "owner-1",
    name: "Owner One",
    role: "OWNER",
    workspaceId: "local-workspace",
  });
  assert.deepEqual(getConfiguredOperator({ OWNER_OPERATOR_ROLE: "TESTER" }), {
    ...defaultLocalOperator,
    role: "TESTER",
  });
});

test("round-trips signed operator sessions and rejects tampered values", () => {
  const session: OperatorSession = {
    id: "owner-1",
    name: "Owner One",
    role: "OWNER",
    workspaceId: "local-workspace",
  };
  const encoded = encodeOperatorSession(session, "test-secret");
  const [, signature] = encoded.split(".");
  const tamperedPayload = Buffer.from(JSON.stringify({ ...session, workspaceId: "other-workspace" }), "utf8").toString("base64url");

  assert.deepEqual(decodeOperatorSession(encoded, "test-secret"), session);
  assert.equal(decodeOperatorSession(`${tamperedPayload}.${signature}`, "test-secret"), null);
  assert.equal(decodeOperatorSession(encoded, "wrong-secret"), null);
  assert.equal(decodeOperatorSession(undefined, "test-secret"), null);
});

test("verifies operator passwords without accepting blank or incorrect values", () => {
  assert.equal(verifyOperatorPassword("correct-password", "correct-password"), true);
  assert.equal(verifyOperatorPassword("wrong-password", "correct-password"), false);
  assert.equal(verifyOperatorPassword("", ""), false);
});

test("formats audit actor labels from authenticated operator identity", () => {
  assert.equal(
    formatActor({
      id: "owner-1",
      name: "Owner One",
      role: "OWNER",
      workspaceId: "local-workspace",
    }),
    "Owner One (owner-1)",
  );
});

test("allows tester-level writes but keeps owner-only actions gated", () => {
  const operator: OperatorSession = {
    id: "operator-1",
    name: "Operator One",
    role: "TESTER",
    workspaceId: "local-workspace",
  };
  const owner: OperatorSession = {
    id: "owner-1",
    name: "Owner One",
    role: "OWNER",
    workspaceId: "local-workspace",
  };

  assert.equal(assertOperatorRole(operator, "TESTER"), operator);
  assert.equal(assertOperatorRole(owner, "TESTER"), owner);
  assert.equal(assertOperatorRole(owner, "OWNER"), owner);
  assert.throws(() => assertOperatorRole(operator, "OWNER"), /Owner role is required for this action\./);
});
