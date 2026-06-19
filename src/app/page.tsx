import { prisma } from "@/lib/prisma";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function formatCurrency(amount: number) {
  return currencyFormatter.format(amount);
}

function badgeClass(status: string) {
  switch (status) {
    case "DELIVERED":
    case "CURRENT":
    case "COMPLETED":
      return "badge-green";
    case "EXPIRING_SOON":
    case "DUE_SOON":
    case "IN_TRANSIT":
      return "badge-yellow";
    case "EXPIRED":
    case "OVERDUE":
    case "CANCELLED":
      return "badge-red";
    default:
      return "badge-gray";
  }
}

export default async function Home() {
  const [loads, expenses, documentAlerts, maintenanceItems, inspections] = await Promise.all([
    prisma.load.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.expense.findMany({ orderBy: { expenseDate: "desc" }, take: 5 }),
    prisma.documentAlert.findMany({ orderBy: { updatedAt: "desc" }, take: 5 }),
    prisma.maintenanceItem.findMany({ orderBy: { updatedAt: "desc" }, take: 5 }),
    prisma.inspectionChecklist.findMany({ orderBy: { inspectionDate: "desc" }, take: 5 }),
  ]);

  const grossRevenue = loads.reduce((sum, load) => sum + (load.rate ?? 0), 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const openLoads = loads.filter((load) => load.status !== "DELIVERED" && load.status !== "CANCELLED").length;
  const urgentItems =
    documentAlerts.filter((item) => item.status !== "CURRENT").length +
    maintenanceItems.filter((item) => item.status === "OVERDUE" || item.status === "DUE_SOON").length;

  return (
    <div className="mx-auto max-w-6xl p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Daily Driver Dashboard</h1>
        <p className="mt-2 text-sm text-slate-400">
          Track loads, expenses, compliance alerts, and truck readiness from one screen.
        </p>
      </header>

      <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="panel p-5">
          <p className="text-sm text-slate-400">Gross Revenue</p>
          <p className="mt-2 text-3xl font-semibold">{formatCurrency(grossRevenue)}</p>
        </div>
        <div className="panel p-5">
          <p className="text-sm text-slate-400">Total Expenses</p>
          <p className="mt-2 text-3xl font-semibold">{formatCurrency(totalExpenses)}</p>
        </div>
        <div className="panel p-5">
          <p className="text-sm text-slate-400">Open Loads</p>
          <p className="mt-2 text-3xl font-semibold">{openLoads}</p>
        </div>
        <div className="panel p-5">
          <p className="text-sm text-slate-400">Urgent Follow-Ups</p>
          <p className="mt-2 text-3xl font-semibold">{urgentItems}</p>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="panel p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Recent Loads</h2>
            <span className="text-xs text-slate-500">{loads.length} recent</span>
          </div>
          <div className="space-y-3">
            {loads.length === 0 ? (
              <p className="text-sm text-slate-500">No loads recorded yet.</p>
            ) : (
              loads.map((load) => (
                <div key={load.id} className="rounded-lg border border-slate-800 bg-slate-900 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">
                        {load.origin} to {load.destination}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {load.broker ?? "Direct"} • {load.commodity ?? "General freight"}
                      </p>
                    </div>
                    <span className={badgeClass(load.status)}>{load.status.replaceAll("_", " ")}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-400">
                    <span>Rate: {formatCurrency(load.rate ?? 0)}</span>
                    <span>Miles: {load.miles ?? 0}</span>
                    <span>RPM: {load.ratePerMile ? `$${load.ratePerMile.toFixed(2)}` : "n/a"}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="panel p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Urgent Alerts</h2>
            <span className="text-xs text-slate-500">documents + maintenance</span>
          </div>
          <div className="space-y-3">
            {[...documentAlerts, ...maintenanceItems]
              .filter((item) => {
                if ("expiresDate" in item) {
                  return item.status !== "CURRENT";
                }

                return item.status === "OVERDUE" || item.status === "DUE_SOON";
              })
              .slice(0, 6)
              .map((item) => (
                <div key={item.id} className="rounded-lg border border-slate-800 bg-slate-900 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="mt-1 text-xs text-slate-400">
                        {"expiresDate" in item
                          ? item.expiresDate
                            ? `Expires ${new Date(item.expiresDate).toLocaleDateString()}`
                            : "Missing expiration date"
                          : item.dueDate
                            ? `Due ${new Date(item.dueDate).toLocaleDateString()}`
                            : item.dueMileage
                              ? `Due at ${item.dueMileage.toLocaleString()} miles`
                              : "No due date set"}
                      </p>
                    </div>
                    <span className={badgeClass(item.status)}>{item.status.replaceAll("_", " ")}</span>
                  </div>
                </div>
              ))}
            {urgentItems === 0 ? <p className="text-sm text-slate-500">No urgent follow-ups right now.</p> : null}
          </div>
        </section>

        <section className="panel p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Recent Expenses</h2>
            <span className="text-xs text-slate-500">{expenses.length} recent</span>
          </div>
          <div className="space-y-3">
            {expenses.length === 0 ? (
              <p className="text-sm text-slate-500">No expenses logged yet.</p>
            ) : (
              expenses.map((expense) => (
                <div key={expense.id} className="rounded-lg border border-slate-800 bg-slate-900 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{expense.category}</p>
                      <p className="mt-1 text-xs text-slate-400">
                        {new Date(expense.expenseDate).toLocaleDateString()} • {expense.vendor ?? "Unknown vendor"}
                      </p>
                    </div>
                    <p className="font-semibold">{formatCurrency(expense.amount)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="panel p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Recent Inspections</h2>
            <span className="text-xs text-slate-500">{inspections.length} logged</span>
          </div>
          <div className="space-y-3">
            {inspections.length === 0 ? (
              <p className="text-sm text-slate-500">No inspections recorded yet.</p>
            ) : (
              inspections.map((inspection) => (
                <div key={inspection.id} className="rounded-lg border border-slate-800 bg-slate-900 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{inspection.type.replaceAll("_", "-")}</p>
                      <p className="mt-1 text-xs text-slate-400">
                        {new Date(inspection.inspectionDate).toLocaleDateString()} • Odometer {inspection.odometer ?? "n/a"}
                      </p>
                    </div>
                    <span className={inspection.overallPassed ? "badge-green" : "badge-red"}>
                      {inspection.overallPassed ? "PASS" : "FAIL"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
