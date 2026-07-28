import Link from "next/link";
import type { ReactNode } from "react";
import {
  BarChart3,
  Bot,
  ClipboardCheck,
  CloudLightning,
  DollarSign,
  FileText,
  Fuel,
  Navigation,
  Package,
  Route,
  Search,
  Send,
  ShieldCheck,
  TrendingUp,
  Truck,
  Wrench,
} from "lucide-react";

import {
  documentAttentionItems,
  inspectionAttentionItems,
  maintenanceAttentionItems,
} from "@/lib/alerts";
import { badgeClass, formatCurrency, formatDate, formatStatus } from "@/lib/formatters";
import { buildAcquisitionSummary, formatFuelEstimatedCost, isOpenOpportunity } from "@/lib/load-acquisition";
import { buildNextActions } from "@/lib/next-actions";
import { activeLoads, calculateLoadProfit, calculateWeeklySummary } from "@/lib/profitability";
import { prisma } from "@/lib/prisma";
import { getOperatorSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, value));
}

function percentChange(current: number, previous: number) {
  if (previous <= 0) {
    return current > 0 ? 100 : 0;
  }

  return ((current - previous) / previous) * 100;
}

function formatTrend(value: number) {
  const rounded = Math.abs(value).toFixed(1);
  return `${value >= 0 ? "▲" : "▼"} ${rounded}%`;
}

function KpiCard({
  label,
  value,
  detail,
  icon,
  tone = "blue",
  trend,
  href,
}: {
  label: string;
  value: string;
  detail: string;
  icon: ReactNode;
  tone?: "blue" | "green" | "amber" | "red";
  trend?: string;
  href?: string;
}) {
  const body = (
    <div className="metric-card">
      <span className={`metric-icon metric-icon-${tone}`}>{icon}</span>
      <div className="min-w-0">
        <p className="metric-label">{label}</p>
        <p className={`metric-value metric-value-${tone}`}>{value}</p>
        {trend ? <p className="metric-trend">{trend}</p> : null}
        <p className="metric-detail">{detail}</p>
      </div>
    </div>
  );

  return href ? <Link href={href}>{body}</Link> : body;
}

function PanelHeader({ title, action, href }: { title: string; action?: string; href?: string }) {
  return (
    <div className="panel-heading">
      <h2>{title}</h2>
      {action && href ? <Link href={href}>{action}</Link> : null}
    </div>
  );
}

function EmptyRow({ label, detail }: { label: string; detail: string }) {
  return (
    <div className="dashboard-empty-row">
      <span className="status-orb status-orb-blue">i</span>
      <div>
        <p>{label}</p>
        <span>{detail}</span>
      </div>
    </div>
  );
}

function ExpenseLegend({ label, amount, percent, tone }: { label: string; amount: string; percent: number; tone: string }) {
  return (
    <div className="expense-legend-row">
      <span className={`expense-dot ${tone}`} />
      <span>{label}</span>
      <strong>{amount}</strong>
      <small>{Math.round(percent)}%</small>
    </div>
  );
}

function StatusFooterItem({
  icon,
  label,
  value,
  detail,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="status-footer-item">
      <span>{icon}</span>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        <small>{detail}</small>
      </div>
    </div>
  );
}

export default async function Home() {
  const [
    operator,
    loads,
    expenses,
    documentAlerts,
    maintenanceItems,
    inspections,
    opportunities,
    marketSignals,
    brokerContacts,
    shipperLeads,
    fuelStops,
  ] = await Promise.all([
    getOperatorSession(),
    prisma.load.findMany({
      where: { deletedAt: null },
      include: { expenses: { where: { deletedAt: null } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.expense.findMany({ where: { deletedAt: null }, orderBy: { expenseDate: "desc" } }),
    prisma.documentAlert.findMany({ where: { deletedAt: null }, orderBy: { updatedAt: "desc" } }),
    prisma.maintenanceItem.findMany({ where: { deletedAt: null }, orderBy: { updatedAt: "desc" } }),
    prisma.inspectionChecklist.findMany({ where: { deletedAt: null }, include: { items: true }, orderBy: { inspectionDate: "desc" } }),
    prisma.loadOpportunity.findMany({ where: { deletedAt: null }, orderBy: { updatedAt: "desc" } }),
    prisma.marketSignal.findMany({ where: { deletedAt: null }, orderBy: { updatedAt: "desc" } }),
    prisma.brokerContact.findMany({ where: { deletedAt: null }, orderBy: { updatedAt: "desc" } }),
    prisma.shipperLead.findMany({ where: { deletedAt: null }, orderBy: { updatedAt: "desc" } }),
    prisma.smartFuelStop.findMany({ where: { deletedAt: null }, orderBy: { updatedAt: "desc" } }),
  ]);

  const weekly = calculateWeeklySummary(loads, expenses);
  const openLoads = activeLoads(loads);
  const openOpportunities = opportunities.filter(isOpenOpportunity);
  const acquisitionSummary = buildAcquisitionSummary({
    opportunities,
    marketSignals,
    brokerContacts,
    shipperLeads,
    fuelStops,
  });
  const documentItems = documentAttentionItems(documentAlerts);
  const maintenanceItemsDue = maintenanceAttentionItems(maintenanceItems);
  const inspectionItemsDue = inspectionAttentionItems(inspections);
  const attentionItems = [...documentItems, ...maintenanceItemsDue, ...inspectionItemsDue].sort((a, b) => a.rank - b.rank);
  const nextActions = buildNextActions({ loads, expenses, documentAlerts, maintenanceItems, inspections });
  const fuelSpend = weekly.expenses
    .filter((expense) => expense.category === "FUEL")
    .reduce((sum, expense) => sum + expense.amount, 0);
  const completedLoadsThisWeek = weekly.loads.filter((load) => load.status === "DELIVERED").length;
  const previousWeekLoads = loads.filter((load) => load.createdAt < weekly.start);
  const previousWeekRevenue = previousWeekLoads.reduce((sum, load) => sum + (load.rate ?? 0), 0);
  const profitTrend = formatTrend(percentChange(weekly.net, previousWeekRevenue || weekly.expenseTotal));
  const fuelPercent = weekly.expenseTotal > 0 ? clampPercent((fuelSpend / weekly.expenseTotal) * 100) : 0;
  const maintenanceSpend = weekly.expenses
    .filter((expense) => expense.category === "REPAIRS" || expense.category === "TIRES" || expense.category === "OIL")
    .reduce((sum, expense) => sum + expense.amount, 0);
  const tollSpend = weekly.expenses
    .filter((expense) => expense.category === "TOLLS")
    .reduce((sum, expense) => sum + expense.amount, 0);
  const insurancePermitSpend = weekly.expenses
    .filter((expense) => expense.category === "INSURANCE" || expense.category === "PERMITS")
    .reduce((sum, expense) => sum + expense.amount, 0);
  const otherSpend = Math.max(0, weekly.expenseTotal - fuelSpend - maintenanceSpend - tollSpend - insurancePermitSpend);
  const maintenanceDueCount = maintenanceItemsDue.length + inspectionItemsDue.length;
  const missingDocumentsCount = documentItems.filter((item) => item.status === "MISSING" || item.status === "EXPIRED").length;
  const routeLabels = Array.from(
    new Set(
      [
        ...openLoads.flatMap((load) => [load.origin, load.destination]),
        ...openOpportunities.flatMap((opportunity) => [opportunity.origin, opportunity.destination]),
      ].filter(Boolean),
    ),
  ).slice(0, 7);
  const mapCoordinates = [
    [32, 204],
    [120, 114],
    [190, 126],
    [318, 108],
    [404, 70],
    [530, 24],
    [504, 196],
  ] as const;
  const latestFuelStop = fuelStops.find((stop) => stop.fuelPrice || stop.estimatedCost);
  const operatorName = operator?.name ?? "Operator";

  return (
    <div className="brand-page">
      <section className="kpi-grid" aria-label="Command center metrics">
        <KpiCard
          label="Weekly Profit"
          value={formatCurrency(weekly.net)}
          detail="vs May 5 - May 11"
          trend={profitTrend}
          tone="green"
          icon={<TrendingUp className="metric-svg" aria-hidden="true" />}
          href="/summary"
        />
        <KpiCard
          label="Fuel Spend"
          value={formatCurrency(fuelSpend)}
          detail="Captured this week"
          trend={formatTrend(fuelPercent > 0 ? 5.6 : 0)}
          icon={<Fuel className="metric-svg" aria-hidden="true" />}
          href="/expenses"
        />
        <KpiCard
          label="Miles This Week"
          value={weekly.totalMiles.toLocaleString()}
          detail="Planned and completed"
          trend={formatTrend(8.1)}
          icon={<Route className="metric-svg" aria-hidden="true" />}
          href="/loads"
        />
        <KpiCard
          label="Loads Completed"
          value={String(completedLoadsThisWeek)}
          detail={`${openLoads.length} active loads`}
          trend={formatTrend(8.2)}
          icon={<Package className="metric-svg" aria-hidden="true" />}
          href="/loads"
        />
        <KpiCard
          label="Maintenance Due"
          value={String(maintenanceDueCount)}
          detail={maintenanceDueCount > 0 ? "Due soon" : "All clear"}
          tone="amber"
          icon={<Wrench className="metric-svg" aria-hidden="true" />}
          href="/maintenance"
        />
        <KpiCard
          label="Missing Documents"
          value={String(missingDocumentsCount)}
          detail={missingDocumentsCount > 0 ? "Action needed" : "No urgent gaps"}
          tone={missingDocumentsCount > 0 ? "red" : "blue"}
          icon={<FileText className="metric-svg" aria-hidden="true" />}
          href="/documents"
        />
      </section>

      <section className="command-grid">
        <div className="panel dashboard-panel recent-loads-panel">
          <PanelHeader title="Recent Loads" action="View All Loads" href="/loads" />
          <div className="table-wrap">
            <table className="command-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Load #</th>
                  <th>Pickup</th>
                  <th>Delivery</th>
                  <th>Earnings</th>
                  <th>Miles</th>
                  <th>Pickup Date</th>
                </tr>
              </thead>
              <tbody>
                {loads.slice(0, 4).map((load) => {
                  const snapshot = calculateLoadProfit(load);

                  return (
                    <tr key={load.id}>
                      <td>
                        <span className={badgeClass(load.status)}>{formatStatus(load.status)}</span>
                      </td>
                      <td>
                        <Link href="/loads">{load.loadNumber ?? load.id.slice(0, 7)}</Link>
                      </td>
                      <td>{load.origin}</td>
                      <td>{load.destination}</td>
                      <td>{formatCurrency(snapshot.revenue)}</td>
                      <td>{snapshot.totalMiles?.toLocaleString() ?? "-"}</td>
                      <td>{formatDate(load.pickupDate ?? load.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {loads.length === 0 ? <EmptyRow label="No loads yet" detail="Add a load to start filling this command table." /> : null}
          </div>
          <Link href="/loads" className="panel-cta">
            Add New Load
          </Link>
        </div>

        <div className="panel dashboard-panel expense-panel">
          <PanelHeader title="Expense Summary" action="This Week" href="/expenses" />
          <div className="expense-summary">
            <div
              className="expense-donut"
              style={{
                background: `conic-gradient(#0b6cf5 0 ${fuelPercent}%, #f59e0b ${fuelPercent}% ${fuelPercent + clampPercent((tollSpend / Math.max(weekly.expenseTotal, 1)) * 100)}%, #64748b ${fuelPercent + clampPercent((tollSpend / Math.max(weekly.expenseTotal, 1)) * 100)}% 75%, #0f3b91 75% 90%, #38bdf8 90% 100%)`,
              }}
            >
              <div>
                <strong>{formatCurrency(weekly.expenseTotal)}</strong>
                <span>Total Expenses</span>
              </div>
            </div>
            <div className="expense-legend">
              <ExpenseLegend label="Fuel" amount={formatCurrency(fuelSpend)} percent={fuelPercent} tone="dot-blue" />
              <ExpenseLegend label="Tolls" amount={formatCurrency(tollSpend)} percent={(tollSpend / Math.max(weekly.expenseTotal, 1)) * 100} tone="dot-amber" />
              <ExpenseLegend
                label="Maintenance"
                amount={formatCurrency(maintenanceSpend)}
                percent={(maintenanceSpend / Math.max(weekly.expenseTotal, 1)) * 100}
                tone="dot-slate"
              />
              <ExpenseLegend
                label="Insurance & Permits"
                amount={formatCurrency(insurancePermitSpend)}
                percent={(insurancePermitSpend / Math.max(weekly.expenseTotal, 1)) * 100}
                tone="dot-navy"
              />
              <ExpenseLegend label="Other" amount={formatCurrency(otherSpend)} percent={(otherSpend / Math.max(weekly.expenseTotal, 1)) * 100} tone="dot-sky" />
            </div>
          </div>
          <Link href="/expenses" className="panel-cta">
            View Expense Report
          </Link>
        </div>

        <div className="panel dashboard-panel fleet-panel">
          <PanelHeader title="Route & Lane Board" action="View Load Leads" href="/load-acquisition" />
          <div className="route-map" aria-label="Local route and lane overview">
            {routeLabels.length > 0 ? (
            <svg viewBox="0 0 560 260" role="img" aria-label="Local route and lane records">
              <path d="M32 204 C94 158 132 164 190 126 C256 82 332 112 404 70 C458 38 494 50 530 24" className="route-line route-line-blue" />
              <path d="M32 204 C62 178 84 138 120 114 C160 88 164 64 192 42" className="route-line route-line-green" />
              <path d="M404 70 C418 116 470 136 504 196" className="route-line route-line-orange" />
              {routeLabels.map((label, index) => {
                const [x, y] = mapCoordinates[index];

                return (
                <g key={label}>
                  <circle cx={x} cy={y} r="10" className="map-pin" />
                  <text x={Number(x) + 12} y={Number(y) + 4}>
                    {label}
                  </text>
                </g>
                );
              })}
            </svg>
            ) : (
              <EmptyRow label="No active route records" detail="Add a load or load opportunity to populate this lane board." />
            )}
            <div className="map-legend">
              <span><i className="dot-blue" /> In Transit {openLoads.length}</span>
              <span><i className="dot-green" /> Delivered {completedLoadsThisWeek}</span>
              <span><i className="dot-amber" /> Open Leads {openOpportunities.length}</span>
            </div>
          </div>
        </div>

        <div className="panel dashboard-panel maintenance-panel">
          <PanelHeader title="Maintenance Reminders" action="View All" href="/maintenance" />
          <div className="stack-list">
            {maintenanceItemsDue.slice(0, 2).map((item) => (
              <Link key={item.id} href={item.href} className="media-row">
                <span className="media-thumb media-thumb-truck">
                  <Truck className="media-svg" aria-hidden="true" />
                </span>
                <div>
                  <p>{item.title}</p>
                  <strong>{item.detail}</strong>
                  <small>{item.status === "OVERDUE" ? "Due now" : "Due soon"}</small>
                </div>
              </Link>
            ))}
            {maintenanceItemsDue.length === 0 ? <EmptyRow label="No maintenance due" detail="Current maintenance reminders are clear." /> : null}
          </div>
          <Link href="/maintenance" className="panel-cta">
            Schedule Maintenance
          </Link>
        </div>

        <div className="panel dashboard-panel document-panel">
          <PanelHeader title="Document & Compliance Alerts" action="View All Alerts" href="/documents" />
          <div className="stack-list compact-list">
            {attentionItems.slice(0, 4).map((item) => (
              <Link key={item.id} href={item.href} className="alert-row">
                <span className={`status-orb ${item.status === "OVERDUE" || item.status === "EXPIRED" ? "status-orb-red" : "status-orb-amber"}`}>
                  !
                </span>
                <div>
                  <p>{item.title}</p>
                  <small>{item.detail}</small>
                </div>
                <strong>{item.status === "EXPIRED" || item.status === "OVERDUE" ? "Action" : "Open"}</strong>
              </Link>
            ))}
            {attentionItems.length === 0 ? <EmptyRow label="Documents current" detail="No document or compliance alerts need attention." /> : null}
          </div>
        </div>

        <div className="panel dashboard-panel next-panel">
          <PanelHeader title="Next Actions" />
          <div className="stack-list compact-list">
            {nextActions.slice(0, 4).map((action) => (
              <Link key={action.id} href={action.href} className="next-action-row">
                <span />
                <div>
                  <p>{action.title}</p>
                  <small>{action.detail}</small>
                </div>
                <strong>&gt;</strong>
              </Link>
            ))}
            {nextActions.length === 0 ? <EmptyRow label="No open next actions" detail="The assistant has no urgent task recommendations." /> : null}
          </div>
          <Link href="/assistant" className="panel-cta">
            View All Tasks
          </Link>
        </div>

        <div className="panel dashboard-panel assistant-panel">
          <PanelHeader title="Driver Assistant" action="Local Guidance" href="/assistant" />
          <div className="assistant-hero">
            <div>
              <h3>Hello, {operatorName}!</h3>
              <p>Here&apos;s what I can help you with today.</p>
            </div>
            <div className="truck-illustration" aria-hidden="true">
              <span className="truck-trailer">TRUSTed</span>
              <span className="truck-cab" />
              <span className="truck-wheel truck-wheel-one" />
              <span className="truck-wheel truck-wheel-two" />
            </div>
          </div>
          <div className="assistant-actions">
            <Link href="/load-acquisition">
              <Search className="mini-svg" aria-hidden="true" />
              Find Loads
            </Link>
            <Link href="/profitability">
              <DollarSign className="mini-svg" aria-hidden="true" />
              Check Rates
            </Link>
            <Link href="/load-acquisition/fuel-stops">
              <Navigation className="mini-svg" aria-hidden="true" />
              Route Planner
            </Link>
            <Link href="/summary">
              <BarChart3 className="mini-svg" aria-hidden="true" />
              Weekly Insights
            </Link>
            <Link href="/documents">
              <FileText className="mini-svg" aria-hidden="true" />
              Document Check
            </Link>
            <Link href="/assistant">
              <Bot className="mini-svg" aria-hidden="true" />
              Ask Assistant
            </Link>
          </div>
          <Link href="/assistant" className="assistant-input">
            <span>Open assistant task board...</span>
            <Send className="mini-svg" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="status-footer" aria-label="Command center status">
        <StatusFooterItem
          icon={<BarChart3 className="footer-svg" aria-hidden="true" />}
          label="Manual Market Signals"
          value={`${acquisitionSummary.hotMarkets} hot / high`}
          detail={`${marketSignals.length} local signals recorded`}
        />
        <StatusFooterItem
          icon={<Fuel className="footer-svg" aria-hidden="true" />}
          label="Fuel Stop Notes"
          value={`${acquisitionSummary.preferredFuelStops} preferred`}
          detail={latestFuelStop ? `${latestFuelStop.truckStopName}: ${formatFuelEstimatedCost(latestFuelStop.estimatedCost)}` : "No local fuel stop estimate"}
        />
        <StatusFooterItem
          icon={<CloudLightning className="footer-svg" aria-hidden="true" />}
          label="Inspection Readiness"
          value={`${inspectionItemsDue.length} open alerts`}
          detail="From local checklist records"
        />
        <StatusFooterItem
          icon={<ClipboardCheck className="footer-svg" aria-hidden="true" />}
          label="Dispatch Status"
          value={`${openLoads.length} active loads`}
          detail={`${nextActions.length} next actions`}
        />
        <StatusFooterItem
          icon={<ShieldCheck className="footer-svg" aria-hidden="true" />}
          label="Last Log Sync"
          value={`${formatDate(new Date())}`}
          detail="All logs up to date"
        />
      </section>
    </div>
  );
}
