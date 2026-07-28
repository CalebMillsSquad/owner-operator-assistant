import type { DocumentAlert, InspectionChecklist, InspectionItem, MaintenanceItem } from "@prisma/client";

import { formatDate } from "@/lib/formatters";

export type InspectionWithItems = InspectionChecklist & { items: InspectionItem[] };

export type AttentionItem = {
  id: string;
  title: string;
  detail: string;
  status: string;
  href: string;
  rank: number;
};

const DAY_MS = 1000 * 60 * 60 * 24;

export function effectiveDocumentStatus(alert: DocumentAlert, now = new Date()) {
  if (alert.status === "MISSING" || !alert.expiresDate) {
    return "MISSING";
  }

  const daysUntilExpiration = (alert.expiresDate.getTime() - now.getTime()) / DAY_MS;
  if (daysUntilExpiration < 0) {
    return "EXPIRED";
  }

  if (daysUntilExpiration <= 60) {
    return "EXPIRING_SOON";
  }

  return "CURRENT";
}

export function documentAttentionItems(alerts: DocumentAlert[], now = new Date()): AttentionItem[] {
  const items: AttentionItem[] = [];

  for (const alert of alerts) {
    const status = effectiveDocumentStatus(alert, now);

    if (status === "CURRENT") {
      continue;
    }

    items.push({
      id: `document-${alert.id}`,
      title: alert.title,
      detail:
        status === "MISSING"
          ? "Missing document or expiration date."
          : `${status === "EXPIRED" ? "Expired" : "Expires"} ${formatDate(alert.expiresDate)}.`,
      status,
      href: "/documents",
      rank: status === "MISSING" ? 10 : status === "EXPIRED" ? 20 : 30,
    });
  }

  return items.sort((a, b) => a.rank - b.rank);
}

export function maintenanceAttentionItems(items: MaintenanceItem[]): AttentionItem[] {
  const attentionItems: AttentionItem[] = [];

  for (const item of items) {
    if (item.status !== "OVERDUE" && item.status !== "DUE_SOON") {
      continue;
    }

    attentionItems.push({
      id: `maintenance-${item.id}`,
      title: item.title,
      detail: item.dueDate
        ? `Due ${formatDate(item.dueDate)}.`
        : item.dueMileage
          ? `Due at ${item.dueMileage.toLocaleString()} miles.`
          : "No due target recorded.",
      status: item.status,
      href: "/maintenance",
      rank: item.status === "OVERDUE" ? 40 : 50,
    });
  }

  return attentionItems.sort((a, b) => a.rank - b.rank);
}

export function hasInspectionToday(inspections: InspectionChecklist[], now = new Date()) {
  return inspections.some((inspection) => inspection.inspectionDate.toDateString() === now.toDateString());
}

export function inspectionAttentionItems(inspections: InspectionWithItems[], now = new Date()): AttentionItem[] {
  const failedInspectionItems = inspections
    .filter((inspection) => !inspection.overallPassed)
    .flatMap((inspection) =>
      inspection.items
        .filter((item) => !item.passed)
        .map((item) => ({
          id: `inspection-${item.id}`,
          title: `${item.category}: ${item.item}`,
          detail: `${inspection.type.replaceAll("_", "-")} failed on ${formatDate(inspection.inspectionDate)}.`,
          status: "FAIL",
          href: "/inspections",
          rank: 60,
        })),
    );

  const missingTodayInspection = hasInspectionToday(inspections, now)
    ? []
    : [
        {
          id: "inspection-today",
          title: "Today's inspection checklist",
          detail: "No pre-trip or post-trip inspection has been logged today.",
          status: "INCOMPLETE",
          href: "/inspections",
          rank: 70,
        },
      ];

  return [...failedInspectionItems, ...missingTodayInspection].sort((a, b) => a.rank - b.rank);
}
