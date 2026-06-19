import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = { title: "Owner Operator Assistant", description: "Trucking business operations" };

const nav = [
  { href: "/", label: "Dashboard" },
  { href: "/loads", label: "Load Tracking" },
  { href: "/expenses", label: "Expenses" },
  { href: "/documents", label: "Documents" },
  { href: "/summary", label: "Weekly Summary" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen">
        <aside className="flex w-56 shrink-0 flex-col border-r border-slate-700 bg-slate-900">
          <div className="border-b border-slate-700 p-4">
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
        </aside>
        <main className="flex-1 overflow-auto">{children}</main>
      </body>
    </html>
  );
}
