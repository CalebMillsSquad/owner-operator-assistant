import Link from "next/link";

import { loginOperatorAction } from "./actions";
import { getSingleSearchParam, type PageSearchParams } from "@/lib/search-params";
import { isAuthConfigured, isPilotMode } from "@/lib/auth";

export default async function LoginPage({ searchParams }: { searchParams: PageSearchParams }) {
  const params = await searchParams;
  const error = getSingleSearchParam(params.error);
  const next = getSingleSearchParam(params.next) || "/audit-log";
  const authConfigured = isAuthConfigured();
  const pilotMode = isPilotMode();

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl items-center p-4 sm:p-6 lg:p-8">
      <section className="panel w-full p-6">
        <p className="brand-kicker">Operator access</p>
        <h1 className="mt-2 text-2xl font-bold">Sign in to continue</h1>
        <p className="mt-2 text-sm text-slate-400">
          {pilotMode ? "Access is limited to the invited Mills Trucking pilot tester and pilot owner." : "Audit review, restore, and production write actions require an authenticated operator session."}
        </p>

        {authConfigured ? (
          <form action={loginOperatorAction} className="mt-6 space-y-4">
            <input type="hidden" name="next" value={next} />
            <label className="block text-sm">
              <span className="mb-2 block text-slate-300">Access password</span>
              <input name="password" type="password" className="input w-full" required autoComplete="current-password" />
            </label>
            {error ? <p className="text-sm text-amber-700">{error}</p> : null}
            <button type="submit" className="btn-primary w-full">
              Sign in
            </button>
          </form>
        ) : pilotMode ? (
          <div className="mt-6 rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            Pilot access is temporarily unavailable because the invited-user environment is incomplete. No local bypass is permitted.
          </div>
        ) : (
          <div className="mt-6 space-y-4 text-sm text-slate-400">
            <p>
              Local development is using the built-in Local Operator session. Configure
              `OWNER_OPERATOR_AUTH_PASSWORD` and `OWNER_OPERATOR_SESSION_SECRET` before production use.
            </p>
            <Link href={next} className="btn-primary inline-flex">
              Continue locally
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
            <label className="block text-sm">
              <span className="mb-2 block text-slate-300">Invited email</span>
              <input name="email" type="email" className="input w-full" required autoComplete="username" />
            </label>
