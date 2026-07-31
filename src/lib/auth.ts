import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getAuthConfig, SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from "@/lib/env";
import { createSessionToken, getSessionCookieOptions, validateAccessPassword, verifySessionToken } from "@/lib/session";

export async function isAuthenticated() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return false;
  }

  return verifySessionToken(token);
}

export async function requireAuthentication() {
  if (!(await isAuthenticated())) {
    redirect("/login");
  }
}

export async function signIn(password: string) {
  const { isConfigured } = getAuthConfig();
  if (!isConfigured) {
    return { ok: false as const, reason: "config" as const };
  }

  if (!(await validateAccessPassword(password))) {
    return { ok: false as const, reason: "invalid" as const };
  }

  const expiresAt = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
  const token = await createSessionToken(expiresAt);
  const cookieStore = await cookies();

  cookieStore.set({
    ...getSessionCookieOptions(expiresAt),
    value: token,
  });

  return { ok: true as const };
}

export async function signOut() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
