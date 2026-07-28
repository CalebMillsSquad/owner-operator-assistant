import { createHmac, timingSafeEqual } from "node:crypto";

export type OperatorRole = "OWNER" | "TESTER";

export type OperatorSession = {
  id: string;
  name: string;
  role: OperatorRole;
  workspaceId: string;
};

export const defaultLocalOperator: OperatorSession = {
  id: "local-operator",
  name: "Local Operator",
  role: "OWNER",
  workspaceId: "local-workspace",
};

type Environment = Readonly<Record<string, string | undefined>>;

export function getConfiguredPassword(env: Environment = process.env) {
  return env.OWNER_OPERATOR_AUTH_PASSWORD ?? env.OPERATOR_AUTH_PASSWORD ?? "";
}

export function getSessionSecret(env: Environment = process.env) {
  return env.OWNER_OPERATOR_SESSION_SECRET ?? env.OPERATOR_SESSION_SECRET ?? getConfiguredPassword(env);
}

export function getConfiguredOperator(env: Environment = process.env): OperatorSession {
  const role = env.OWNER_OPERATOR_ROLE === "TESTER" ? "TESTER" : "OWNER";

  return {
    id: env.OWNER_OPERATOR_ID?.trim() || defaultLocalOperator.id,
    name: env.OWNER_OPERATOR_NAME?.trim() || defaultLocalOperator.name,
    role,
    workspaceId: env.OWNER_OPERATOR_WORKSPACE_ID?.trim() || "local-workspace",
  };
}

export function isAuthEnvironmentConfigured(env: Environment = process.env) {
  return Boolean(getConfiguredPassword(env) && getSessionSecret(env));
}

function signPayload(payload: string, secret: string) {
  if (!secret) {
    throw new Error("Operator authentication is not configured.");
  }

  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function constantTimeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function encodeOperatorSession(session: OperatorSession, secret: string) {
  const payload = Buffer.from(JSON.stringify(session), "utf8").toString("base64url");
  return `${payload}.${signPayload(payload, secret)}`;
}

export function decodeOperatorSession(value: string | undefined, secret: string) {
  if (!value) {
    return null;
  }

  const [payload, signature] = value.split(".");
  if (!payload || !signature || !constantTimeEqual(signature, signPayload(payload, secret))) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as OperatorSession;
    if (!parsed.id || !parsed.name || !parsed.workspaceId || (parsed.role !== "OWNER" && parsed.role !== "TESTER")) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function verifyOperatorPassword(password: string, expectedPassword: string) {
  return Boolean(expectedPassword) && constantTimeEqual(password, expectedPassword);
}

export function assertOperatorRole(session: OperatorSession, requiredRole: OperatorRole) {
  if (requiredRole === "OWNER" && session.role !== "OWNER") {
    throw new Error("Owner role is required for this action.");
  }

  if (requiredRole === "TESTER" && session.role !== "TESTER" && session.role !== "OWNER") {
    throw new Error("Pilot tester access is required for this action.");
  }

  return session;
}

export function formatActor(session: OperatorSession) {
  return `${session.name} (${session.id})`;
}
