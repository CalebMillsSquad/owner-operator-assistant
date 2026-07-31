import type { Metadata } from "next";
import Link from "next/link";

import { logoutAction } from "@/app/actions";
import { isAuthenticated } from "@/lib/auth";

import "./globals.css";

export const metadata: Metadata = { title: "Owner Operator Assistant", description: "Trucking business operations" };

const nav = [
  { href: "/", label: "Dashboard" },
  { href: "/loads", label: "Load Tracking" },
  { href: "/expenses", label: "Expenses" },
  { href: "/documents", label: "Documents" },
  { href: "/summary", label: "Weekly Summary" },
  { href: "/profitability", label: "Profitability" },
  { href: "/maintenance", label: "Maintenance" },
  { href: "/inspections", label: "Inspections" },
  { href: "/assistant", label: "Next Actions" },
];

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const authenticated = await isAuthenticated();

  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100">
        {authenticated ? (
          <div className="flex min-h-screen flex-col md:flex-row">
            <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-900/95 backdrop-blur md:hidden">
              <div className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-[11px] font-medium tracking-[0.2em] text-blue-400">OWNER OPERATOR</p>
                  <p className="text-sm font-semibold text-white">Assistant</p>
                </div>
                <details className="relative">
                  <summary className="btn-secondary list-none cursor-pointer px-3 py-2">Menu</summary>
                  <div className="absolute right-0 top-12 w-64 rounded-xl border border-slate-800 bg-slate-900 p-2 shadow-2xl">
                    <nav className="flex flex-col gap-1">
                      {nav.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className="rounded-md px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </nav>
                    <form action={logoutAction} className="mt-2 border-t border-slate-800 pt-2">
                      <button type="submit" className="btn-secondary w-full justify-center">
                        Sign Out
                      </button>
                    </form>
                  </div>
                </details>
              </div>
            </header>

            <aside className="hidden w-56 shrink-0 flex-col border-r border-slate-800 bg-slate-900 md:flex">
              <div className="border-b border-slate-800 p-4">
                <p className="text-xs font-medium text-blue-400">OWNER OPERATOR</p>
                <p className="text-sm font-semibold text-white">Assistant</p>
              </div>
              <nav className="flex flex-1 flex-col gap-1 p-3">
                {nav.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-md px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              <form action={logoutAction} className="border-t border-slate-800 p-3">
                <button type="submit" className="btn-secondary w-full justify-center">
                  Sign Out
                </button>
              </form>
            </aside>

            <main className="flex-1 overflow-auto">{children}</main>
          </div>
        ) : (
          children
        )}
      </body>
    </html>
  );
}
