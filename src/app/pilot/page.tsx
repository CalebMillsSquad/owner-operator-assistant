import Link from "next/link";
import { Building2, Database, MessageSquare, RotateCcw, ShieldCheck } from "lucide-react";

import { resetPilotWorkspaceAction } from "@/app/pilot-actions";
import { requirePilotWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function PilotHomePage() {
  const session = await requirePilotWorkspace();
  const feedback = session.role === "OWNER" ? await prisma.pilotFeedback.findMany({ where: { workspaceId: session.workspaceId }, orderBy: { createdAt: "desc" }, take: 25 }) : [];
  return <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
    <header className="border-b border-blue-100 pb-6"><p className="brand-kicker">External testing workspace</p><h1 className="mt-2 text-3xl font-bold text-[#0a2342]">Mills Trucking pilot</h1><p className="mt-2 max-w-3xl text-slate-600">A private, invitation-only evaluation of the Assistant Command Center and Freight Intelligence workflows using fictional records only.</p></header>
    <section className="grid gap-5 py-6 md:grid-cols-3">
      <div className="panel p-5"><Building2 className="h-6 w-6 text-blue-700" /><h2 className="mt-3 font-bold">Company profile</h2><p className="mt-2 text-sm text-slate-600">Mills Trucking is the invited pilot company. The approved company vision graphic will appear here only after the Founder provides the asset.</p></div>
      <div className="panel p-5"><ShieldCheck className="h-6 w-6 text-emerald-700" /><h2 className="mt-3 font-bold">Your access</h2><p className="mt-2 text-sm text-slate-600">Signed in as {session.name} ({session.role}). Access is restricted to workspace <code>{session.workspaceId}</code>.</p></div>
      <div className="panel p-5"><Database className="h-6 w-6 text-violet-700" /><h2 className="mt-3 font-bold">Fictional data</h2><p className="mt-2 text-sm text-slate-600">No real driver, load, receipt, document, or financial records belong in this environment.</p></div>
    </section>
    <section className="border-t border-blue-100 py-6"><h2 className="text-xl font-bold text-[#0a2342]">Start testing</h2><div className="mt-4 flex flex-wrap gap-3"><Link href="/" className="btn-primary">Assistant Command Center</Link><Link href="/freight-intelligence" className="btn-primary">Freight Intelligence</Link></div></section>
    {session.role === "OWNER" ? <section className="border-t border-blue-100 py-6"><div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="text-xl font-bold text-[#0a2342]">Pilot administration</h2><p className="mt-1 text-sm text-slate-600">Feedback is private to this pilot. Reset will restore the original fictional seed once PostgreSQL provisioning is complete.</p></div><form action={resetPilotWorkspaceAction}><button type="submit" className="inline-flex items-center gap-2 rounded-md border border-red-300 px-4 py-2 text-sm font-semibold text-red-700"><RotateCcw className="h-4 w-4" />Reset pilot</button></form></div><div className="mt-6 space-y-3"><h3 className="flex items-center gap-2 font-bold"><MessageSquare className="h-4 w-4" />Recent feedback</h3>{feedback.length ? feedback.map(item => <article key={item.id} className="panel p-4"><div className="flex flex-wrap justify-between gap-2 text-xs text-slate-500"><span>{item.category} on {item.route}</span><time>{item.createdAt.toLocaleString()}</time></div><p className="mt-2 text-sm">{item.description}</p><p className="mt-2 text-xs text-slate-500">Viewport: {item.viewportWidth ?? "?"} x {item.viewportHeight ?? "?"} · {item.submittedByName}</p></article>) : <p className="text-sm text-slate-500">No feedback submitted yet.</p>}</div></section> : null}
  </div>;
}
