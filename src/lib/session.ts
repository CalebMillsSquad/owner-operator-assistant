import { getAuthConfig, SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from "@/lib/env";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

type SessionPayload = {
  exp: number;
};

function toBase64Url(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function fromBase64Url(value: string) {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const decoded = atob(padded);

  return Uint8Array.from(decoded, (char) => char.charCodeAt(0));
}

async function importHmacKey(secret: string) {
  return crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ]);
}

async function sign(value: string, secret: string) {
  const key = await importHmacKey(secret);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));

  return toBase64Url(new Uint8Array(signature));
}

async function sha256(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return new Uint8Array(digest);
}

function constantTimeEqual(left: Uint8Array, right: Uint8Array) {
  if (left.length !== right.length) {
    return false;
  }

  let result = 0;
  for (let index = 0; index < left.length; index += 1) {
    result |= left[index] ^ right[index];
  }

  return result === 0;
}

export async function validateAccessPassword(input: string) {
  const { accessPassword, isConfigured } = getAuthConfig();
  if (!isConfigured) {
    return false;
  }

  const [expected, received] = await Promise.all([sha256(accessPassword), sha256(input)]);
  return constantTimeEqual(expected, received);
}

export async function createSessionToken(expiresAt: number) {
  const { sessionSecret } = getAuthConfig();
  const payload = toBase64Url(encoder.encode(JSON.stringify({ exp: expiresAt } satisfies SessionPayload)));
  const signature = await sign(payload, sessionSecret);

  return `${payload}.${signature}`;
}

export async function verifySessionToken(token: string) {
  const { isConfigured, sessionSecret } = getAuthConfig();
  if (!isConfigured) {
    return false;
  }

  const [payload, signature] = token.split(".");
  if (!payload || !signature) {
    return false;
  }

  try {
    const key = await importHmacKey(sessionSecret);
    const isValid = await crypto.subtle.verify("HMAC", key, fromBase64Url(signature), encoder.encode(payload));
    if (!isValid) {
      return false;
    }

    const parsed = JSON.parse(decoder.decode(fromBase64Url(payload))) as SessionPayload;
    return typeof parsed.exp === "number" && parsed.exp > Date.now();
  } catch {
    return false;
  }
}

export function getSessionCookieOptions(expiresAt: number) {
  return {
    name: SESSION_COOKIE_NAME,
    value: "",
    expires: new Date(expiresAt),
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}
