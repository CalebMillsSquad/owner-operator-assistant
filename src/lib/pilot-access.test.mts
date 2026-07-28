import assert from "node:assert/strict";
import test from "node:test";
import { NextRequest } from "next/server.js";

import { encodeOperatorSession } from "./auth-core.ts";
import { proxy } from "../proxy.ts";

const originalEnv = { ...process.env };

test.afterEach(() => {
  process.env = { ...originalEnv };
});

test("redirects anonymous and wrong-workspace requests to invitation-only login", () => {
  process.env.PILOT_MODE = "true";
  process.env.PILOT_WORKSPACE_ID = "mills-pilot";
  process.env.OWNER_OPERATOR_SESSION_SECRET = "test-session-secret";

  const anonymous = proxy(new NextRequest("https://pilot.example.invalid/freight-intelligence"));
  assert.equal(anonymous.status, 307);
  assert.equal(anonymous.headers.get("location"), "https://pilot.example.invalid/login?next=%2Ffreight-intelligence");

  const wrong = new NextRequest("https://pilot.example.invalid/loads", {
    headers: { cookie: `ooa_operator_session=${encodeOperatorSession({ id: "tester", name: "Tester", role: "TESTER", workspaceId: "other" }, "test-session-secret")}` },
  });
  assert.equal(proxy(wrong).status, 307);
});

test("allows a signed invited tester only inside the configured pilot workspace", () => {
  process.env.PILOT_MODE = "true";
  process.env.PILOT_WORKSPACE_ID = "mills-pilot";
  process.env.OWNER_OPERATOR_SESSION_SECRET = "test-session-secret";
  const request = new NextRequest("https://pilot.example.invalid/loads", {
    headers: { cookie: `ooa_operator_session=${encodeOperatorSession({ id: "tester", name: "Tester", role: "TESTER", workspaceId: "mills-pilot" }, "test-session-secret")}` },
  });
  assert.equal(proxy(request).status, 200);
});
