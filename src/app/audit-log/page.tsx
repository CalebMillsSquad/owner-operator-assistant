import Link from "next/link";
import type { Prisma } from "@prisma/client";

import {
  restoreBrokerContact,
  restoreDocumentAlertAction,
  restoreExpenseAction,
  restoreFuelLogAction,
  restoreInspectionAction,
  restoreLoadAction,
  restoreLoadOpportunity,
  restoreMaintenanceItemAction,
  restoreMarketSignal,
  restoreShipperLead,
  restoreSmartFuelStop,
} from "@/app/actions";
import { badgeClass, formatCurrency, formatDate, formatStatus } from "@/lib/formatters";
import { prisma } from "@/lib/prisma";
import { getSingleSearchParam, type PageSearchParams } from "@/lib/search-params";
import { requireOperatorSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

const auditActionOptions = ["SOFT_DELETE", "RESTORE"] as const;
const auditEntityTypes = [
  "Load",
  "Expense",
  "FuelLog",
  "DocumentAlert",
  "MaintenanceItem",
  "InspectionChecklist",
  "LoadOpportunity",
  "MarketSignal",
  "BrokerContact",
  "ShipperLead",
  "SmartFuelStop",
] as const;
const auditPageSize = 25;

function decodeMessage(value: string | undefined) {
  if (!value) {
    return "";
  }

  try {
    return decodeURIComponent(value);
  } catch {
    return "Restore failed due to an unexpected format issue. Please try again.";
  }
}

function getPositivePage(value: string | undefined) {
  const parsed = Number.parseInt(value ?? "", 10);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function buildAuditLogHref({
  action,
  query,
  actor,
  entityType,
  page,
}: {
  action?: string;
  query?: string;
  actor?: string;
  entityType?: string;
  page?: number;
}) {
  const params = new URLSearchParams();

  if (action) {
    params.set("action", action);
  }

  if (query) {
    params.set("q", query);
  }

  if (actor) {
    params.set("actor", actor);
  }

  if (entityType) {
    params.set("entityType", entityType);
  }

  if (page && page > 1) {
    params.set("page", String(page));
  }

  const queryString = params.toString();

  return queryString ? `/audit-log?${queryString}` : "/audit-log";
}

export default async function AuditLogPage({ searchParams }: { searchParams: PageSearchParams }) {
  const operator = await requireOperatorSession();
  const params = await searchParams;
  const restoreStatus = getSingleSearchParam(params.restore);
  const restoreEntity = getSingleSearchParam(params.restoreEntity);
  const restoreMessage = decodeMessage(getSingleSearchParam(params.restoreMessage));
  const actionFilter = getSingleSearchParam(params.action);
  const auditActionFilter = auditActionOptions.includes(actionFilter as (typeof auditActionOptions)[number])
    ? (actionFilter as (typeof auditActionOptions)[number])
    : undefined;
  const auditQuery = getSingleSearchParam(params.q).trim();
  const auditActor = getSingleSearchParam(params.actor).trim();
  const auditEntityType = getSingleSearchParam(params.entityType).trim();
  const auditEntityFilter = auditEntityType || undefined;
  const requestedPage = getPositivePage(getSingleSearchParam(params.page));
  const auditWhere: Prisma.AuditLogWhereInput = {
    ...(auditActionFilter ? { action: auditActionFilter } : {}),
    ...(auditEntityFilter ? { entityType: auditEntityFilter } : {}),
    ...(auditActor ? { actor: { contains: auditActor } } : {}),
    ...(auditQuery
      ? {
          OR: [
            { entityType: { contains: auditQuery } },
            { entityId: { contains: auditQuery } },
            { details: { contains: auditQuery } },
            { reason: { contains: auditQuery } },
            { actor: { contains: auditQuery } },
          ],
        }
      : {}),
  };
  const auditLogCount = await prisma.auditLog.count({ where: auditWhere });
  const totalAuditPages = Math.max(1, Math.ceil(auditLogCount / auditPageSize));
  const auditPage = Math.min(requestedPage, totalAuditPages);
  const hasAuditFilters = Boolean(auditActionFilter || auditQuery || auditActor || auditEntityFilter);
  const auditResultStart = auditLogCount === 0 ? 0 : (auditPage - 1) * auditPageSize + 1;
  const auditResultEnd = Math.min(auditPage * auditPageSize, auditLogCount);
  const previousAuditHref = buildAuditLogHref({
    action: auditActionFilter,
    query: auditQuery,
    actor: auditActor,
    entityType: auditEntityFilter,
    page: auditPage - 1,
  });
  const nextAuditHref = buildAuditLogHref({
    action: auditActionFilter,
    query: auditQuery,
    actor: auditActor,
    entityType: auditEntityFilter,
    page: auditPage + 1,
  });

  const [
    recentAuditLog,
    deletedLoads,
    deletedExpenses,
    deletedFuelLogs,
    deletedDocumentAlerts,
    deletedMaintenanceItems,
    deletedInspections,
    deletedOpportunities,
    deletedMarketSignals,
    deletedBrokers,
    deletedShippers,
    deletedFuelStops,
  ] = await Promise.all([
    prisma.auditLog.findMany({
      where: auditWhere,
      orderBy: { createdAt: "desc" },
      skip: (auditPage - 1) * auditPageSize,
      take: auditPageSize,
    }),
    prisma.load.findMany({
      where: { deletedAt: { not: null } },
      orderBy: { deletedAt: "desc" },
      select: { id: true, origin: true, destination: true, deletedAt: true, createdAt: true, updatedAt: true },
    }),
    prisma.expense.findMany({
      where: { deletedAt: { not: null } },
      orderBy: { deletedAt: "desc" },
      select: {
        id: true,
        category: true,
        amount: true,
        expenseDate: true,
        vendor: true,
        deletedAt: true,
      },
    }),
    prisma.fuelLog.findMany({
      where: { deletedAt: { not: null } },
      orderBy: { deletedAt: "desc" },
      select: {
        id: true,
        fuelDate: true,
        vendor: true,
        gallons: true,
        totalCost: true,
        deletedAt: true,
      },
    }),
    prisma.documentAlert.findMany({
      where: { deletedAt: { not: null } },
      orderBy: { deletedAt: "desc" },
      select: { id: true, title: true, status: true, expiresDate: true, deletedAt: true },
    }),
    prisma.maintenanceItem.findMany({
      where: { deletedAt: { not: null } },
      orderBy: { deletedAt: "desc" },
      select: { id: true, title: true, status: true, dueDate: true, deletedAt: true },
    }),
    prisma.inspectionChecklist.findMany({
      where: { deletedAt: { not: null } },
      orderBy: { deletedAt: "desc" },
      select: { id: true, type: true, inspectionDate: true, deletedAt: true },
    }),
    prisma.loadOpportunity.findMany({
      where: { deletedAt: { not: null } },
      orderBy: { deletedAt: "desc" },
      select: { id: true, origin: true, destination: true, sourceType: true, status: true, deletedAt: true },
    }),
    prisma.marketSignal.findMany({
      where: { deletedAt: { not: null } },
      orderBy: { deletedAt: "desc" },
      select: { id: true, marketName: true, demandLevel: true, sourceType: true, deletedAt: true },
    }),
    prisma.brokerContact.findMany({
      where: { deletedAt: { not: null } },
      orderBy: { deletedAt: "desc" },
      select: { id: true, companyName: true, relationshipStatus: true, deletedAt: true },
    }),
    prisma.shipperLead.findMany({
      where: { deletedAt: { not: null } },
      orderBy: { deletedAt: "desc" },
      select: { id: true, companyName: true, status: true, deletedAt: true },
    }),
    prisma.smartFuelStop.findMany({
      where: { deletedAt: { not: null } },
      orderBy: { deletedAt: "desc" },
      select: { id: true, truckStopName: true, location: true, preferred: true, estimatedCost: true, deletedAt: true },
    }),
  ]);

  const hasDeletedRecords =
    deletedLoads.length +
      deletedExpenses.length +
      deletedFuelLogs.length +
      deletedDocumentAlerts.length +
      deletedMaintenanceItems.length +
      deletedInspections.length +
      deletedOpportunities.length +
      deletedMarketSignals.length +
      deletedBrokers.length +
    deletedShippers.length +
    deletedFuelStops.length >
    0;
  const restoreFeedback =
    restoreStatus === "ok"
      ? {
          tone: "success",
          title: "Restore complete",
          message: `${restoreEntity || "Record"} is back in active workflows.`,
        }
      : restoreStatus === "error" && restoreMessage
        ? {
            tone: "error",
            title: "Restore needs attention",
            message: `Restore failed for ${restoreEntity || "record"}: ${restoreMessage}`,
          }
        : null;

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      <header className="mb-8">
        <p className="brand-kicker">Governance</p>
        <h1 className="mt-2 text-2xl font-bold">Audit Log & Recovery</h1>
        <p className="mt-1 text-sm text-slate-400">
          Review soft-delete activity and restore records from Loads, Expenses, Documents, Maintenance, Inspections, and Load Acquisition.
        </p>
        <p className="mt-2 text-xs text-slate-500">
          Signed in as {operator.name} ({operator.role.toLowerCase()}).
        </p>
      </header>

      {restoreFeedback ? (
        <section
          className={`mb-6 rounded-lg border p-4 ${
            restoreFeedback.tone === "success"
              ? "border-emerald-500/30 bg-emerald-500/10"
              : "border-amber-500/30 bg-amber-500/10"
          }`}
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p
                className={`text-sm font-semibold ${
                  restoreFeedback.tone === "success" ? "text-emerald-200" : "text-amber-200"
                }`}
              >
                {restoreFeedback.title}
              </p>
              <p className="mt-1 text-sm text-slate-300">{restoreFeedback.message}</p>
            </div>
            <Link href="/audit-log" className="text-xs text-[#2563eb]">
              Dismiss
            </Link>
          </div>
        </section>
      ) : null}

      <section className="mb-8 panel p-5">
        <div className="panel-heading">
          <h2>Recent Audit Trail</h2>
          <span>{auditLogCount} matching events</span>
        </div>
        <form
          action="/audit-log"
          className="mb-4 grid gap-3 md:grid-cols-[220px_220px_1fr_auto_auto_auto] md:items-center"
        >
          <select name="action" className="input" aria-label="Audit action" defaultValue={auditActionFilter ?? ""}>
            <option value="">All actions</option>
            {auditActionOptions.map((action) => (
              <option key={action} value={action}>
                {formatStatus(action)}
              </option>
            ))}
          </select>
          <select
            name="entityType"
            className="input"
            aria-label="Audit entity type"
            defaultValue={auditEntityFilter ?? ""}
          >
            <option value="">All entity types</option>
            {auditEntityTypes.map((entityType) => (
              <option key={entityType} value={entityType}>
                {entityType}
              </option>
            ))}
          </select>
          <input
            name="q"
            className="input"
            placeholder="Search type, ID, actor, reason, or details"
            defaultValue={auditQuery}
            aria-label="Search audit events"
          />
          <input
            name="actor"
            className="input"
            placeholder="Filter actor"
            defaultValue={auditActor}
            aria-label="Filter by actor"
          />
          <button type="submit" className="btn-primary">
            Apply
          </button>
          {hasAuditFilters ? (
            <Link href="/audit-log" className="btn-secondary">
              Clear
            </Link>
          ) : null}
        </form>
        {recentAuditLog.length === 0 ? (
          <p className="text-sm text-slate-500">
            {hasAuditFilters ? "No audit events match the current filters." : "No audit events yet."}
          </p>
        ) : (
          <>
            <div className="space-y-2">
              {recentAuditLog.map((entry) => (
                <div key={entry.id} className="surface-row space-y-1 text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={badgeClass(entry.action)}>{entry.action}</span>
                    <p className="font-semibold">{entry.entityType}</p>
                    <p className="text-slate-400">{entry.entityId}</p>
                  </div>
                  <p className="text-slate-300">{entry.details ?? "No details captured."}</p>
                  <div className="grid gap-1 text-xs text-slate-500 sm:grid-cols-2 xl:grid-cols-4">
                    <span>Actor: {entry.actor ?? "Unspecified"}</span>
                    <span>Reason: {entry.reason ?? "Unspecified"}</span>
                    <span>When: {formatDate(entry.createdAt)}</span>
                    <span>Recorded: {new Date(entry.createdAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-col gap-3 border-t border-white/10 pt-4 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
              <p>
                Showing {auditResultStart}-{auditResultEnd} of {auditLogCount} events · Page {auditPage} of {totalAuditPages}
              </p>
              <div className="flex flex-wrap gap-2">
                {auditPage > 1 ? (
                  <Link href={previousAuditHref} className="btn-secondary">
                    Previous
                  </Link>
                ) : null}
                {auditPage < totalAuditPages ? (
                  <Link href={nextAuditHref} className="btn-secondary">
                    Next
                  </Link>
                ) : null}
              </div>
            </div>
          </>
        )}
      </section>

      <section className="panel p-5">
        <div className="panel-heading">
          <div>
            <h2>Deleted Records (Undo)</h2>
            <p className="text-xs text-slate-400">Use Restore to bring a record back into active workflows.</p>
          </div>
          <Link href="/audit-log" className="text-xs text-[#60a5fa]">
            Refresh
          </Link>
        </div>

        {hasDeletedRecords ? null : <p className="text-sm text-slate-500">No deleted records to restore right now.</p>}

        {deletedLoads.length > 0 ? (
          <section className="mb-6">
            <h3 className="mb-3 text-sm font-semibold">Deleted Loads</h3>
            <div className="space-y-2">
              {deletedLoads.map((load) => (
                <div key={load.id} className="surface-row flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div className="text-sm">
                    <p className="font-medium">
                      {load.origin} to {load.destination}
                    </p>
                    <p className="text-xs text-slate-400">Deleted {formatDate(load.deletedAt)}</p>
                  </div>
                  <form
                    action={async () => {
                      "use server";
                      await restoreLoadAction(load.id);
                    }}
                  >
                    <button type="submit" className="btn-secondary">
                      Restore
                    </button>
                  </form>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {deletedExpenses.length > 0 ? (
          <section className="mb-6">
            <h3 className="mb-3 text-sm font-semibold">Deleted Expenses</h3>
            <div className="space-y-2">
              {deletedExpenses.map((expense) => (
                <div key={expense.id} className="surface-row flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div className="text-sm">
                    <p className="font-medium">
                      {formatStatus(expense.category)} - {expense.vendor ?? "Unknown vendor"}
                    </p>
                    <p className="text-xs text-slate-400">
                      {formatDate(expense.expenseDate)} · {formatCurrency(expense.amount, true)} · Deleted {formatDate(expense.deletedAt)}
                    </p>
                  </div>
                  <form
                    action={async () => {
                      "use server";
                      await restoreExpenseAction(expense.id);
                    }}
                  >
                    <button type="submit" className="btn-secondary">
                      Restore
                    </button>
                  </form>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {deletedFuelLogs.length > 0 ? (
          <section className="mb-6">
            <h3 className="mb-3 text-sm font-semibold">Deleted Fuel Purchases</h3>
            <div className="space-y-2">
              {deletedFuelLogs.map((fuelLog) => (
                <div key={fuelLog.id} className="surface-row flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div className="text-sm">
                    <p className="font-medium">{fuelLog.vendor ?? "Unknown vendor"}</p>
                    <p className="text-xs text-slate-400">
                      {formatDate(fuelLog.fuelDate)} · {fuelLog.gallons.toFixed(3)} gal · {formatCurrency(fuelLog.totalCost, true)} · Deleted {formatDate(fuelLog.deletedAt)}
                    </p>
                  </div>
                  <form
                    action={async () => {
                      "use server";
                      await restoreFuelLogAction(fuelLog.id);
                    }}
                  >
                    <button type="submit" className="btn-secondary">Restore</button>
                  </form>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {deletedDocumentAlerts.length > 0 ? (
          <section className="mb-6">
            <h3 className="mb-3 text-sm font-semibold">Deleted Document Alerts</h3>
            <div className="space-y-2">
              {deletedDocumentAlerts.map((alert) => (
                <div key={alert.id} className="surface-row flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div className="text-sm">
                    <p className="font-medium">{alert.title}</p>
                    <p className="text-xs text-slate-400">
                      Status {formatStatus(alert.status)} · Expires {formatDate(alert.expiresDate)} · Deleted {formatDate(alert.deletedAt)}
                    </p>
                  </div>
                  <form
                    action={async () => {
                      "use server";
                      await restoreDocumentAlertAction(alert.id);
                    }}
                  >
                    <button type="submit" className="btn-secondary">
                      Restore
                    </button>
                  </form>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {deletedMaintenanceItems.length > 0 ? (
          <section className="mb-6">
            <h3 className="mb-3 text-sm font-semibold">Deleted Maintenance Items</h3>
            <div className="space-y-2">
              {deletedMaintenanceItems.map((item) => (
                <div key={item.id} className="surface-row flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div className="text-sm">
                    <p className="font-medium">{item.title}</p>
                    <p className="text-xs text-slate-400">
                      Status {formatStatus(item.status)} · Due {formatDate(item.dueDate)} · Deleted {formatDate(item.deletedAt)}
                    </p>
                  </div>
                  <form
                    action={async () => {
                      "use server";
                      await restoreMaintenanceItemAction(item.id);
                    }}
                  >
                    <button type="submit" className="btn-secondary">
                      Restore
                    </button>
                  </form>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {deletedInspections.length > 0 ? (
          <section className="mb-6">
            <h3 className="mb-3 text-sm font-semibold">Deleted Inspections</h3>
            <div className="space-y-2">
              {deletedInspections.map((inspection) => (
                <div key={inspection.id} className="surface-row flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div className="text-sm">
                    <p className="font-medium">{formatStatus(inspection.type)}</p>
                    <p className="text-xs text-slate-400">
                      {formatDate(inspection.inspectionDate)} · Deleted {formatDate(inspection.deletedAt)}
                    </p>
                  </div>
                  <form
                    action={async () => {
                      "use server";
                      await restoreInspectionAction(inspection.id);
                    }}
                  >
                    <button type="submit" className="btn-secondary">
                      Restore
                    </button>
                  </form>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {deletedOpportunities.length > 0 ? (
          <section className="mb-6">
            <h3 className="mb-3 text-sm font-semibold">Deleted Load Opportunities</h3>
            <div className="space-y-2">
              {deletedOpportunities.map((opportunity) => (
                <div key={opportunity.id} className="surface-row flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div className="text-sm">
                    <p className="font-medium">
                      {opportunity.origin} to {opportunity.destination}
                    </p>
                    <p className="text-xs text-slate-400">
                      {formatStatus(opportunity.sourceType)} · {formatStatus(opportunity.status)} · Deleted {formatDate(opportunity.deletedAt)}
                    </p>
                  </div>
                  <form
                    action={async () => {
                      "use server";
                      await restoreLoadOpportunity(opportunity.id);
                    }}
                  >
                    <button type="submit" className="btn-secondary">
                      Restore
                    </button>
                  </form>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {deletedMarketSignals.length > 0 ? (
          <section className="mb-6">
            <h3 className="mb-3 text-sm font-semibold">Deleted Market Signals</h3>
            <div className="space-y-2">
              {deletedMarketSignals.map((signal) => (
                <div key={signal.id} className="surface-row flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div className="text-sm">
                    <p className="font-medium">{signal.marketName}</p>
                    <p className="text-xs text-slate-400">
                      Demand {formatStatus(signal.demandLevel)} · Source {formatStatus(signal.sourceType)} · Deleted {formatDate(signal.deletedAt)}
                    </p>
                  </div>
                  <form
                    action={async () => {
                      "use server";
                      await restoreMarketSignal(signal.id);
                    }}
                  >
                    <button type="submit" className="btn-secondary">
                      Restore
                    </button>
                  </form>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {deletedBrokers.length > 0 ? (
          <section className="mb-6">
            <h3 className="mb-3 text-sm font-semibold">Deleted Brokers</h3>
            <div className="space-y-2">
              {deletedBrokers.map((broker) => (
                <div key={broker.id} className="surface-row flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div className="text-sm">
                    <p className="font-medium">{broker.companyName}</p>
                    <p className="text-xs text-slate-400">
                      {formatStatus(broker.relationshipStatus)} · Deleted {formatDate(broker.deletedAt)}
                    </p>
                  </div>
                  <form
                    action={async () => {
                      "use server";
                      await restoreBrokerContact(broker.id);
                    }}
                  >
                    <button type="submit" className="btn-secondary">
                      Restore
                    </button>
                  </form>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {deletedShippers.length > 0 ? (
          <section className="mb-6">
            <h3 className="mb-3 text-sm font-semibold">Deleted Shippers</h3>
            <div className="space-y-2">
              {deletedShippers.map((shipper) => (
                <div key={shipper.id} className="surface-row flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div className="text-sm">
                    <p className="font-medium">{shipper.companyName}</p>
                    <p className="text-xs text-slate-400">
                      {formatStatus(shipper.status)} · Deleted {formatDate(shipper.deletedAt)}
                    </p>
                  </div>
                  <form
                    action={async () => {
                      "use server";
                      await restoreShipperLead(shipper.id);
                    }}
                  >
                    <button type="submit" className="btn-secondary">
                      Restore
                    </button>
                  </form>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {deletedFuelStops.length > 0 ? (
          <section>
            <h3 className="mb-3 text-sm font-semibold">Deleted Fuel Stops</h3>
            <div className="space-y-2">
              {deletedFuelStops.map((stop) => (
                <div key={stop.id} className="surface-row flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div className="text-sm">
                    <p className="font-medium">{stop.truckStopName}</p>
                    <p className="text-xs text-slate-400">
                      {stop.location} · {stop.preferred ? "Preferred" : "Planned"} · {formatCurrency(stop.estimatedCost, true)} est.
                      cost · Deleted {formatDate(stop.deletedAt)}
                    </p>
                  </div>
                  <form
                    action={async () => {
                      "use server";
                      await restoreSmartFuelStop(stop.id);
                    }}
                  >
                    <button type="submit" className="btn-secondary">
                      Restore
                    </button>
                  </form>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </section>
    </div>
  );
}
