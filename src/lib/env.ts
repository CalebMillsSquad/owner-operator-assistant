const DEFAULT_DATABASE_URL = "file:./dev.db";

export const AUTH_PASSWORD_ENV = "APP_ACCESS_PASSWORD";
export const SESSION_SECRET_ENV = "SESSION_SECRET";
export const SESSION_COOKIE_NAME = "owner_operator_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 14;

export function getDatabaseUrl() {
  return process.env.DATABASE_URL?.trim() || DEFAULT_DATABASE_URL;
}

export function getAuthConfig() {
  const accessPassword = process.env[AUTH_PASSWORD_ENV]?.trim() ?? "";
  const sessionSecret = process.env[SESSION_SECRET_ENV]?.trim() ?? "";

  return {
    accessPassword,
    sessionSecret,
    isConfigured: accessPassword.length > 0 && sessionSecret.length > 0,
  };
}
