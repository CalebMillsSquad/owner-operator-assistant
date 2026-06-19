import { prisma } from "@/lib/prisma";

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

export default async function DashboardPage() {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const [activeLoads, recentExpenses, alerts, weeklyLoads, weeklyExpenses] = await Promise.all([
    prisma.load.findMany({ where: { status: { in: ["BOOKED", "IN_TRANSIT"] } }, orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.expense.findMany({ orderBy: { expenseDate: "desc" }, take: 5 }),
    prisma.documentAlert.findMany({ where: { status: { in: ["EXPIRING_SOON", "EXPIRED", "MISSING"] } }, take: 5 }),
    prisma.load.findMany({ where: { createdAt: { gte: weekStart }, status: "DELIVERED" } }),
    prisma.expense.findMany({ where: { expenseDate: { gte: weekStart } } }),
  ]);

  const weekRevenue = weeklyLoads.reduce((sum, load) => sum + (load.rate ?? 0), 0);
  const weekExpTotal = weeklyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const weekNet = weekRevenue - weekExpTotal;

  return (
    <div className="mx-auto max-w-6xl p-8">
      <header className="mb-8">
        <p className="text-sm text-blue-400">Owner Operator</p>
        <h1 className="text-3xl font-bold">Daily Dashboard</h1>
        <p className="mt-1 text-sm text-slate-400">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </p>
      </header>

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="panel p-5"><p className="text-sm text-slate-400">Week Revenue</p><p className="mt-1 text-3xl font-bold text-green-400">{formatCurrency(weekRevenue)}</p></div>
        <div className="panel p-5"><p className="text-sm text-slate-400">Week Expenses</p><p className="mt-1 text-3xl font-bold text-red-400">{formatCurrency(weekExpTotal)}</p></div>
        <div className="panel p-5"><p className="text-sm text-slate-400">Week Net</p><p className={`mt-1 text-3xl font-bold ${weekNet >= 0 ? "text-green-400" : "text-red-400"}`}>{formatCurrency(weekNet)}</p></div>
      </div>

      {alerts.length > 0 && (
        <div className="panel mb-6 border-red-800 p-5">
          <h2 className="mb-3 font-semibold text-red-400">⚠ Document Alerts</h2>
          <ul className="space-y-2">
            {alerts.map((alert) => (
              <li key={alert.id} className="flex justify-between text-sm">
                <span>{alert.title}</span>
                <span className={`badge ${alert.status === "EXPIRED" || alert.status === "MISSING" ? "badge-red" : "badge-yellow"}`}>
                  {alert.status.replace("_", " ")}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="panel p-5">
          <h2 className="mb-3 font-semibold">Active Loads</h2>
          {activeLoads.length === 0 ? (
            <p className="text-sm text-slate-400">No active loads.</p>
          ) : (
            <ul className="space-y-2">
              {activeLoads.map((load) => (
                <li key={load.id} className="flex justify-between text-sm">
                  <span>{load.origin} → {load.destination}</span>
                  <span className="badge">{load.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="panel p-5">
          <h2 className="mb-3 font-semibold">Recent Expenses</h2>
          {recentExpenses.length === 0 ? (
            <p className="text-sm text-slate-400">No expenses yet.</p>
          ) : (
            <ul className="space-y-2">
              {recentExpenses.map((expense) => (
                <li key={expense.id} className="flex justify-between text-sm">
                  <span>{expense.category}</span>
                  <span className="text-red-400">{formatCurrency(expense.amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
