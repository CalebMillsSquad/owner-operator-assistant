import Link from "next/link";

import { createDocumentAlertAction, deleteDocumentAlertAction } from "@/app/actions";
import { ConfirmDeleteButton } from "@/components/ConfirmDeleteButton";
import { documentAttentionItems, effectiveDocumentStatus } from "@/lib/alerts";
import { badgeClass, formatDate, formatStatus } from "@/lib/formatters";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DocumentsPage() {
  const [alerts, documentAuditEvents, deletedReferenceCount] = await Promise.all([
    prisma.documentAlert.findMany({ where: { deletedAt: null }, orderBy: { updatedAt: "desc" } }),
    prisma.auditLog.findMany({
      where: { entityType: "DocumentAlert" },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.documentAlert.count({ where: { deletedAt: { not: null } } }),
  ]);
  const attentionItems = documentAttentionItems(alerts);
  const currentCount = alerts.filter((alert) => effectiveDocumentStatus(alert) === "CURRENT").length;
  const missingCount = alerts.filter((alert) => effectiveDocumentStatus(alert) === "MISSING").length;
  const expiredCount = alerts.filter((alert) => effectiveDocumentStatus(alert) === "EXPIRED").length;
  const expiringSoonCount = alerts.filter((alert) => effectiveDocumentStatus(alert) === "EXPIRING_SOON").length;
  const notesCount = alerts.filter((alert) => alert.notes?.trim()).length;
  const needsReviewCount = missingCount + expiredCount + expiringSoonCount;
  const reviewAlerts = alerts
    .map((alert) => ({ alert, status: effectiveDocumentStatus(alert) }))
    .filter(({ status }) => status !== "CURRENT")
    .sort((a, b) => {
      const rank = { MISSING: 10, EXPIRED: 20, EXPIRING_SOON: 30 } as const;
      return rank[a.status as keyof typeof rank] - rank[b.status as keyof typeof rank];
    });

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Document References</h1>
        <p className="mt-1 text-sm text-slate-400">
          Track registrations, permits, insurance, renewals, and other document references you keep in your file system.
        </p>
        <p className="mt-2 text-xs text-slate-500">No file upload pipeline is active in this version.</p>
      </header>

      <section className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="panel p-5">
          <p className="text-sm text-slate-400">Documents Tracked</p>
          <p className="mt-2 text-3xl font-semibold">{alerts.length}</p>
        </div>
        <div className="panel p-5">
          <p className="text-sm text-slate-400">Needs Attention</p>
          <p className="mt-2 text-3xl font-semibold">{attentionItems.length}</p>
        </div>
        <div className="panel p-5">
          <p className="text-sm text-slate-400">Highest Priority</p>
          <p className="mt-2 text-2xl font-semibold">{attentionItems[0]?.status ? formatStatus(attentionItems[0].status) : "Clear"}</p>
        </div>
      </section>

      <section className="mb-6 panel p-5">
        <div className="panel-heading">
          <div>
            <h2>Reference Readiness Report</h2>
            <p className="text-xs text-slate-400">Metadata-only audit view for document references, review gaps, and recovery history.</p>
          </div>
          <Link href="/audit-log?entityType=DocumentAlert" className="text-xs text-[#60a5fa]">
            Open document audit log
          </Link>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <div className="surface-row">
            <p className="text-xs text-slate-500">Current</p>
            <p className="mt-1 text-2xl font-semibold">{currentCount}</p>
          </div>
          <div className="surface-row">
            <p className="text-xs text-slate-500">Expiring Soon</p>
            <p className="mt-1 text-2xl font-semibold">{expiringSoonCount}</p>
          </div>
          <div className="surface-row">
            <p className="text-xs text-slate-500">Expired</p>
            <p className="mt-1 text-2xl font-semibold">{expiredCount}</p>
          </div>
          <div className="surface-row">
            <p className="text-xs text-slate-500">Missing Dates</p>
            <p className="mt-1 text-2xl font-semibold">{missingCount}</p>
          </div>
          <div className="surface-row">
            <p className="text-xs text-slate-500">Notes Captured</p>
            <p className="mt-1 text-2xl font-semibold">
              {notesCount}/{alerts.length}
            </p>
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          {deletedReferenceCount} deleted document reference{deletedReferenceCount === 1 ? "" : "s"} available in recovery.
        </p>
      </section>

      <section className="mb-6 grid gap-6 xl:grid-cols-2">
        <div className="panel p-5">
          <div className="panel-heading">
            <h2>Reference Review Queue</h2>
            <span>{needsReviewCount} needing review</span>
          </div>
          {attentionItems.length === 0 ? (
            <p className="text-sm text-slate-500">No missing, expired, or soon-expiring document references right now.</p>
          ) : (
            <div className="space-y-2">
              {reviewAlerts.slice(0, 6).map(({ alert, status }) => {
                return (
                  <div key={alert.id} className="surface-row flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{alert.title}</p>
                        <span className={badgeClass(status)}>{formatStatus(status)}</span>
                      </div>
                      <p className="mt-1 text-xs text-slate-400">
                        {alert.expiresDate ? `Review date ${formatDate(alert.expiresDate)}` : "Add a review or expiration date"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {alert.notes?.trim() ? "Notes captured" : "No reference notes captured yet"}
                      </p>
                    </div>
                    <Link href={`/documents/${alert.id}/edit`} className="btn-secondary">
                      Review
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="panel p-5">
          <div className="panel-heading">
            <h2>Recent Document Audit Activity</h2>
            <span>{documentAuditEvents.length} recent events</span>
          </div>
          {documentAuditEvents.length === 0 ? (
            <p className="text-sm text-slate-500">No document reference recovery events have been recorded yet.</p>
          ) : (
            <div className="space-y-2">
              {documentAuditEvents.map((event) => (
                <div key={event.id} className="surface-row text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={badgeClass(event.action)}>{formatStatus(event.action)}</span>
                    <span className="text-slate-400">{formatDate(event.createdAt)}</span>
                  </div>
                  <p className="mt-1 text-slate-300">{event.details ?? "No details captured."}</p>
                  <p className="mt-1 text-xs text-slate-500">Actor: {event.actor ?? "Unspecified"}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <section className="panel p-5">
          <h2 className="mb-4 font-semibold">Add Document Reference</h2>
          <form action={createDocumentAlertAction} className="grid gap-3">
            <input name="title" required className="input" placeholder="Document title" />
            <input name="expiresDate" type="date" className="input" />
            <textarea name="notes" rows={3} className="input" placeholder="Notes" />
            <button type="submit" className="btn-primary">
              Save Reference
            </button>
          </form>
        </section>

        <section className="space-y-4">
          {alerts.length === 0 ? (
            <div className="panel p-5 text-sm text-slate-500">
              No document alerts yet. Add insurance, registration, permits, and other paperwork so renewals do not sneak up.
            </div>
          ) : (
            alerts.map((alert) => {
              const status = effectiveDocumentStatus(alert);
              return (
            <div key={alert.id} className="panel p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold">{alert.title}</h2>
                  <p className="mt-1 text-sm text-slate-400">
                        {alert.expiresDate ? `Expires ${formatDate(alert.expiresDate)}` : "No expiration date on file"}
                      </p>
                      {alert.notes ? <p className="mt-2 text-sm text-[#324761]">Reference notes: {alert.notes}</p> : null}
                    </div>
                    <div className="flex shrink-0 flex-wrap justify-end gap-2">
                      <span className={badgeClass(status)}>{formatStatus(status)}</span>
                      <Link href={`/documents/${alert.id}/edit`} className="btn-secondary">
                        Edit
                      </Link>
                      <form
                        action={async () => {
                          "use server";
                          await deleteDocumentAlertAction(alert.id);
                        }}
                      >
                        <ConfirmDeleteButton itemName={`document alert ${alert.title}`} />
                      </form>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </section>
      </div>
    </div>
  );
}
