import Link from "next/link";

import {
  documentAttentionItems,
  inspectionAttentionItems,
  maintenanceAttentionItems,
} from "@/lib/alerts";
import { badgeClass, formatStatus } from "@/lib/formatters";
import { buildNextActions, priorityBadge } from "@/lib/next-actions";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AssistantPage() {
  const [documentAlerts, maintenanceItems, loads, expenses, inspections] = await Promise.all([
    prisma.documentAlert.findMany({ where: { deletedAt: null }, orderBy: { updatedAt: "desc" } }),
    prisma.maintenanceItem.findMany({ where: { deletedAt: null }, orderBy: { updatedAt: "desc" } }),
    prisma.load.findMany({
      where: { deletedAt: null },
      include: { expenses: { where: { deletedAt: null } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.expense.findMany({ where: { deletedAt: null }, orderBy: { expenseDate: "desc" } }),
    prisma.inspectionChecklist.findMany({ where: { deletedAt: null }, include: { items: true }, orderBy: { inspectionDate: "desc" } }),
  ]);

  const actions = buildNextActions({ loads, expenses, documentAlerts, maintenanceItems, inspections });
  const attentionItems = [
    ...documentAttentionItems(documentAlerts),
    ...maintenanceAttentionItems(maintenanceItems),
    ...inspectionAttentionItems(inspections),
  ].sort((a, b) => a.rank - b.rank);
  const topAction = actions[0];

  return (
    <div className="mx-auto max-w-6xl p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Next-Action Assistant</h1>
        <p className="mt-1 text-sm text-slate-400">
          Rules-based recommendations from current loads, expenses, documents, maintenance, and inspections.
        </p>
      </header>

      <section className="panel mb-6 p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="brand-kicker">Do This First</p>
            <h2 className="mt-2 text-xl font-semibold">{topAction.title}</h2>
            <p className="mt-2 text-sm text-[#324761]">{topAction.detail}</p>
            <p className="mt-2 text-xs text-slate-500">{topAction.reason}</p>
          </div>
          <div className="flex shrink-0 flex-col items-start gap-3 md:items-end">
            <span className={priorityBadge(topAction.priority)}>{topAction.priority.toUpperCase()}</span>
            <Link href={topAction.href} className="btn-primary">
              Open
            </Link>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="panel p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Recommendation Queue</h2>
            <span className="text-xs text-slate-500">{actions.length} actions</span>
          </div>
          <div className="space-y-4">
            {actions.length === 0 ? (
              <p className="text-sm text-slate-500">No urgent or upcoming tasks right now.</p>
            ) : (
              actions.map((action) => (
                <div key={action.id} className="surface-row p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">{action.title}</h3>
                      <p className="mt-2 text-sm text-[#324761]">{action.detail}</p>
                      <p className="mt-2 text-xs text-slate-500">{action.reason}</p>
                    </div>
                    <span className={priorityBadge(action.priority)}>{action.priority.toUpperCase()}</span>
                  </div>
                  <Link href={action.href} className="mt-4 inline-flex text-sm font-medium text-[#145ea0] hover:text-[#0d3158]">
                    Open related page
                  </Link>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="panel p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Readiness Items</h2>
            <span className="text-xs text-slate-500">documents + maintenance + inspections</span>
          </div>
          <div className="space-y-3">
            {attentionItems.length === 0 ? (
              <p className="text-sm text-slate-500">No readiness alerts are open.</p>
            ) : (
              attentionItems.map((item) => (
                <Link key={item.id} href={item.href} className="surface-row block">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="mt-1 text-xs text-slate-400">{item.detail}</p>
                    </div>
                    <span className={badgeClass(item.status)}>{formatStatus(item.status)}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
