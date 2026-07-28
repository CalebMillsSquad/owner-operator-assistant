import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

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
  type OperatorRole,
  type OperatorSession,
  verifyOperatorPassword,
} from "@/lib/auth-core";

export type { OperatorRole, OperatorSession };

const sessionCookieName = "ooa_operator_session";

export function isAuthConfigured() {
  if (isPilotMode()) {
    return Boolean(
      process.env.PILOT_TESTER_EMAIL &&
      process.env.PILOT_TESTER_PASSWORD &&
      process.env.PILOT_OWNER_EMAIL &&
      process.env.PILOT_OWNER_PASSWORD &&
      getSessionSecret(),
    );
  }
  return isAuthEnvironmentConfigured();
}

export function isPilotMode() {
  return process.env.PILOT_MODE === "true";
}

export function isProductionAuthReady() {
  return isAuthConfigured();
}

export async function getOperatorSession() {
  if (!isAuthConfigured()) {
    return process.env.NODE_ENV === "production" ? null : defaultLocalOperator;
  }

  const cookieStore = await cookies();
  return decodeOperatorSession(cookieStore.get(sessionCookieName)?.value, getSessionSecret());
}

export async function signInOperator(email: string, password: string) {
  if (isPilotMode()) {
    const normalizedEmail = email.trim().toLowerCase();
    const testerEmail = process.env.PILOT_TESTER_EMAIL?.trim().toLowerCase();
    const ownerEmail = process.env.PILOT_OWNER_EMAIL?.trim().toLowerCase();
    const testerPassword = process.env.PILOT_TESTER_PASSWORD ?? "";
    const ownerPassword = process.env.PILOT_OWNER_PASSWORD ?? "";
    const workspaceId = process.env.PILOT_WORKSPACE_ID?.trim() || "mills-trucking-pilot";
    const identity = normalizedEmail === testerEmail && verifyOperatorPassword(password, testerPassword)
      ? { id: "mills-pilot-tester", name: process.env.PILOT_TESTER_NAME?.trim() || "Mills Trucking Tester", role: "TESTER" as const, workspaceId }
      : normalizedEmail === ownerEmail && verifyOperatorPassword(password, ownerPassword)
        ? { id: "mills-pilot-owner", name: process.env.PILOT_OWNER_NAME?.trim() || "Pilot Owner", role: "OWNER" as const, workspaceId }
        : null;

    if (!identity) {
      return { ok: false, message: "Invalid invited pilot credentials." };
    }

    const cookieStore = await cookies();
    cookieStore.set(sessionCookieName, encodeOperatorSession(identity, getSessionSecret()), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8,
    });
    return { ok: true };
  }

  const expectedPassword = getConfiguredPassword();
  if (!verifyOperatorPassword(password, expectedPassword)) {
    return { ok: false, message: "Invalid operator password." };
  }

  const cookieStore = await cookies();
  cookieStore.set(sessionCookieName, encodeOperatorSession(getConfiguredOperator(), getSessionSecret()), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  return { ok: true };
}

export async function signOutOperator() {
  const cookieStore = await cookies();
  cookieStore.delete(sessionCookieName);
}

export async function requireOperatorSession() {
  const session = await getOperatorSession();
  if (!session) {
    redirect("/login");
  }

  return session;
}

export async function requirePilotWorkspace() {
  const session = await requireOperatorSession();
  const expectedWorkspaceId = process.env.PILOT_WORKSPACE_ID?.trim() || "mills-trucking-pilot";
  if (isPilotMode() && session.workspaceId !== expectedWorkspaceId) {
    throw new Error("Session is not authorized for this pilot workspace.");
  }
  return session;
}

export async function requireOperatorRole(requiredRole: OperatorRole) {
  const session = await requireOperatorSession();
  return assertOperatorRole(session, requiredRole);
}

export async function getAuditActorLabel() {
  const session = await requireOperatorSession();
  return formatActor(session);
}
