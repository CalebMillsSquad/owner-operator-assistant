import type { DocumentAlert, Expense, MaintenanceItem } from "@prisma/client";

import {
  documentAttentionItems,
  inspectionAttentionItems,
  type InspectionWithItems,
} from "@/lib/alerts";
import { formatCurrency, formatDate } from "@/lib/formatters";
import {
  activeLoads,
  calculateLoadProfit,
  calculateWeeklySummary,
  type LoadWithExpenses,
} from "@/lib/profitability";

export type NextActionPriority = "high" | "medium" | "low";

export type NextAction = {
  id: string;
  title: string;
  detail: string;
  reason: string;
  priority: NextActionPriority;
  href: string;
};

type NextActionInput = {
  loads: LoadWithExpenses[];
  expenses: Expense[];
  documentAlerts: DocumentAlert[];
  maintenanceItems: MaintenanceItem[];
  inspections: InspectionWithItems[];
  now?: Date;
};

export function priorityBadge(priority: NextActionPriority) {
  return priority === "high" ? "badge-red" : priority === "medium" ? "badge-yellow" : "badge-gray";
}

export function buildNextActions({
  loads,
  expenses,
  documentAlerts,
  maintenanceItems,
  inspections,
  now = new Date(),
}: NextActionInput): NextAction[] {
  const actions: NextAction[] = [];

  for (const item of documentAttentionItems(documentAlerts, now)) {
    actions.push({
      id: item.id,
      title:
        item.status === "MISSING"
          ? `Add missing document: ${item.title}`
          : item.status === "EXPIRED"
            ? `Renew expired document: ${item.title}`
            : `Check expiring document: ${item.title}`,
      detail: item.detail,
      reason: "Document issues can stop dispatch, inspection readiness, or payment paperwork.",
      priority: item.status === "EXPIRING_SOON" ? "medium" : "high",
      href: item.href,
    });
  }

  for (const item of maintenanceItems) {
    if (item.status === "OVERDUE" || item.status === "DUE_SOON") {
      actions.push({
        id: `maintenance-${item.id}`,
        title: `${item.status === "OVERDUE" ? "Review overdue" : "Schedule due"} maintenance: ${item.title}`,
        detail: item.dueDate
          ? `Due ${formatDate(item.dueDate)}.`
          : item.dueMileage
            ? `Due at ${item.dueMileage.toLocaleString()} miles.`
            : "No due target recorded.",
        reason: "Maintenance problems become downtime and can affect safety readiness.",
        priority: item.status === "OVERDUE" ? "high" : "medium",
        href: "/maintenance",
      });
    }
  }

  for (const item of inspectionAttentionItems(inspections, now)) {
    actions.push({
      id: item.id,
      title: item.status === "FAIL" ? `Fix inspection item: ${item.title}` : "Complete today's inspection",
      detail: item.detail,
      reason: "Inspection records keep defects visible before the truck moves.",
      priority: item.status === "FAIL" ? "high" : "medium",
      href: item.href,
    });
  }

  for (const load of activeLoads(loads)) {
    const snapshot = calculateLoadProfit(load);

    if (snapshot.missingFields.includes("rate")) {
      actions.push({
        id: `load-rate-${load.id}`,
        title: `Add missing rate for ${load.origin} to ${load.destination}`,
        detail: "The app cannot calculate revenue, net, or rate per mile until the load rate is captured.",
        reason: "Missing load rates hide whether the week is making money.",
        priority: "high",
        href: "/loads",
      });
    }

    if (snapshot.missingFields.includes("loaded miles") || snapshot.missingFields.includes("deadhead miles")) {
      actions.push({
        id: `load-miles-${load.id}`,
        title: `Add mileage for ${load.origin} to ${load.destination}`,
        detail: `Record ${snapshot.missingFields.includes("loaded miles") ? "loaded" : "deadhead"} miles to complete revenue and profit-per-mile calculations.`,
        reason: "Owner-operators need rate per mile to judge freight quality.",
        priority: "medium",
        href: "/loads",
      });
    }

    if (snapshot.status === "At Risk") {
      actions.push({
        id: `load-risk-${load.id}`,
        title: `Review ${load.loadNumber ?? `${load.origin} to ${load.destination}`}; expenses are above revenue`,
        detail: `Direct expenses are ${formatCurrency(snapshot.linkedExpenseTotal)} against ${formatCurrency(snapshot.revenue)} revenue.`,
        reason: "A negative load result needs review before it is treated as a normal operating result.",
        priority: "high",
        href: `/loads/${load.id}`,
      });
    }
  }

  for (const load of loads.filter((item) => item.status === "DELIVERED" && item.expenses.length === 0)) {
    actions.push({
      id: `load-expenses-${load.id}`,
      title: `Add expenses for delivered load to ${load.destination}`,
      detail: "No fuel, toll, scale, lumper, or other costs are tied to this delivered load yet.",
      reason: "Delivered loads without expenses usually overstate profit.",
      priority: "medium",
      href: "/expenses",
    });
  }

  const missingReceiptCount = expenses.filter((expense) => !expense.receiptPath).length;
  if (missingReceiptCount > 0) {
    actions.push({
      id: "expense-receipts-missing",
      title: `Attach receipt references for ${missingReceiptCount} expense record${missingReceiptCount === 1 ? "" : "s"}`,
      detail: "Add reference notes, such as file path, receipt number, or folder tag, so the business record is easier to reconcile later.",
      reason: "Missing receipt references make expense review, audit prep, and expense correction harder.",
      priority: "medium",
      href: "/expenses",
    });
  }

  const weeklySummary = calculateWeeklySummary(loads, expenses, now);
  if (weeklySummary.loads.length > 0 || weeklySummary.expenses.length > 0) {
    actions.push({
      id: "weekly-profitability-review",
      title: weeklySummary.net >= 0 ? "Review weekly profitability" : "Review negative weekly net",
      detail: `This week is at ${formatCurrency(weeklySummary.net)} net from ${formatCurrency(
        weeklySummary.loadRevenue,
      )} revenue and ${formatCurrency(weeklySummary.expenseTotal)} expenses.`,
      reason: "A weekly review catches bad rates, uncaptured expenses, and cash-flow drift early.",
      priority: weeklySummary.net < 0 ? "high" : "low",
      href: "/summary",
    });
  }

  if (actions.length === 0) {
    actions.push({
      id: "start-with-loads",
      title: "Add the first active load",
      detail: "Start by entering the load you are working now, then attach expenses and documents as they happen.",
      reason: "The dashboard becomes useful once it has the current load and cost picture.",
      priority: "low",
      href: "/loads",
    });
  }

  const priorityRank: Record<NextActionPriority, number> = { high: 1, medium: 2, low: 3 };
  return actions.sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority]);
}
