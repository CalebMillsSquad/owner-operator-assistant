import { prisma } from "@/lib/prisma";

function priorityClass(priority: "high" | "medium" | "low") {
  switch (priority) {
    case "high":
      return "badge-red";
    case "medium":
      return "badge-yellow";
    default:
      return "badge-gray";
  }
}

export default async function AssistantPage() {
  const [documentAlerts, maintenanceItems, loads, inspections] = await Promise.all([
    prisma.documentAlert.findMany({ orderBy: { updatedAt: "desc" } }),
    prisma.maintenanceItem.findMany({ orderBy: { updatedAt: "desc" } }),
    prisma.load.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.inspectionChecklist.findMany({ orderBy: { inspectionDate: "desc" }, take: 1 }),
  ]);

  const actions: Array<{ title: string; detail: string; priority: "high" | "medium" | "low" }> = [];

  for (const alert of documentAlerts) {
    if (alert.status === "EXPIRED" || alert.status === "MISSING") {
      actions.push({
        title: `Resolve document issue: ${alert.title}`,
        detail: alert.expiresDate
          ? `Expired on ${new Date(alert.expiresDate).toLocaleDateString()}.`
          : "No expiration date is on file.",
        priority: "high",
      });
    } else if (alert.status === "EXPIRING_SOON") {
      actions.push({
        title: `Renew soon: ${alert.title}`,
        detail: `Expires ${alert.expiresDate ? new Date(alert.expiresDate).toLocaleDateString() : "soon"}.`,
        priority: "medium",
      });
    }
  }

  for (const item of maintenanceItems) {
    if (item.status === "OVERDUE" || item.status === "DUE_SOON") {
      actions.push({
        title: `${item.status === "OVERDUE" ? "Complete overdue" : "Schedule upcoming"} maintenance: ${item.title}`,
        detail: item.dueDate
          ? `Due ${new Date(item.dueDate).toLocaleDateString()}.`
          : item.dueMileage
            ? `Due at ${item.dueMileage.toLocaleString()} miles.`
            : "No due target recorded.",
        priority: item.status === "OVERDUE" ? "high" : "medium",
      });
    }
  }

  for (const load of loads) {
    if (load.status === "BOOKED") {
      actions.push({
        title: `Prepare load from ${load.origin} to ${load.destination}`,
        detail: "Confirm pickup details, permits, and fuel plan.",
        priority: "medium",
      });
    }
    if (load.status === "IN_TRANSIT") {
      actions.push({
        title: `Close out in-transit load to ${load.destination}`,
        detail: "Update delivery status and attach any trip expenses.",
        priority: "medium",
      });
    }
  }

  const latestInspection = inspections[0];
  if (!latestInspection || new Date(latestInspection.inspectionDate).toDateString() !== new Date().toDateString()) {
    actions.push({
      title: "Run today’s inspection checklist",
      detail: "Log a pre-trip or post-trip inspection before ending the day.",
      priority: "low",
    });
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Next-Action Assistant</h1>
        <p className="mt-1 text-sm text-slate-400">A prioritized view of what needs attention next.</p>
      </header>

      <div className="space-y-4">
        {actions.length === 0 ? (
          <div className="panel p-5 text-sm text-slate-500">No urgent or upcoming tasks right now.</div>
        ) : (
          actions.map((action, index) => (
            <div key={`${action.title}-${index}`} className="panel p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold">{action.title}</h2>
                  <p className="mt-2 text-sm text-slate-300">{action.detail}</p>
                </div>
                <span className={priorityClass(action.priority)}>{action.priority.toUpperCase()}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
