import { redirect } from "next/navigation";

import { loginAction } from "@/app/actions";
import { isAuthenticated } from "@/lib/auth";
import { getAuthConfig, AUTH_PASSWORD_ENV, SESSION_SECRET_ENV } from "@/lib/env";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string | string[];
    next?: string | string[];
  }>;
};

function getSearchParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  if (await isAuthenticated()) {
    redirect("/");
  }

  const { error, next } = await searchParams;
  const authConfig = getAuthConfig();
  const errorCode = getSearchParamValue(error);
  const nextPath = getSearchParamValue(next) ?? "/";

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-6">
      <div className="panel w-full max-w-md p-6 sm:p-8">
        <div className="mb-6">
          <p className="text-xs font-medium tracking-[0.2em] text-blue-400">OWNER OPERATOR</p>
          <h1 className="mt-2 text-2xl font-bold text-white">Secure driver access</h1>
          <p className="mt-2 text-sm text-slate-400">
            Sign in with your deployment password before opening the dashboard on your phone.
          </p>
        </div>

        {!authConfig.isConfigured ? (
          <div className="rounded-lg border border-yellow-800 bg-yellow-950/60 p-4 text-sm text-yellow-100">
            Set <code>{AUTH_PASSWORD_ENV}</code> and <code>{SESSION_SECRET_ENV}</code> before deploying this app.
          </div>
        ) : null}

        {errorCode === "invalid" ? (
          <div className="mb-4 rounded-lg border border-red-900 bg-red-950/60 p-4 text-sm text-red-100">
            The access password is incorrect.
          </div>
        ) : null}

        <form action={loginAction} className="grid gap-4">
          <input type="hidden" name="next" value={nextPath} />
          <label className="grid gap-2 text-sm">
            <span className="text-slate-300">Access password</span>
            <input
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="current-password"
              className="input"
              placeholder="Enter your deployment password"
            />
          </label>
          <button type="submit" className="btn-primary" disabled={!authConfig.isConfigured}>
            Open dashboard
          </button>
        </form>
      </div>
    </main>
  );
}
