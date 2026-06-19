import { prisma } from "@/lib/prisma";

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

export default async function SummaryPage() {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const [weekLoads, weekExpenses] = await Promise.all([
    prisma.load.findMany({ where: { createdAt: { gte: weekStart } } }),
    prisma.expense.findMany({ where: { expenseDate: { gte: weekStart } }, orderBy: { category: "asc" } }),
  ]);

  const weekRevenue = weekLoads.reduce((sum, load) => sum + (load.rate ?? 0), 0);
  const weekExpTotal = weekExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const weekNet = weekRevenue - weekExpTotal;

  const byCategory = weekExpenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] ?? 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="mx-auto max-w-4xl p-8">
      <header className="mb-8"><h1 className="text-2xl font-bold">Weekly Summary</h1><p className="mt-1 text-sm text-slate-400">Week of {weekStart.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p></header>

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="panel p-5"><p className="text-sm text-slate-400">Revenue</p><p className="text-2xl font-bold text-green-400">{formatCurrency(weekRevenue)}</p></div>
        <div className="panel p-5"><p className="text-sm text-slate-400">Expenses</p><p className="text-2xl font-bold text-red-400">{formatCurrency(weekExpTotal)}</p></div>
        <div className="panel p-5"><p className="text-sm text-slate-400">Net</p><p className={`text-2xl font-bold ${weekNet >= 0 ? "text-green-400" : "text-red-400"}`}>{formatCurrency(weekNet)}</p></div>
      </div>

      <div className="panel mb-6 p-5">
        <h2 className="mb-4 font-semibold">Loads This Week ({weekLoads.length})</h2>
        {weekLoads.length === 0 ? <p className="text-sm text-slate-400">No loads this week.</p> : (
          <table className="w-full text-sm">
            <thead><tr className="border-b border-slate-700 text-left text-slate-400"><th className="pb-2">Route</th><th className="pb-2">Miles</th><th className="pb-2 text-right">Rate</th><th className="pb-2 text-right">$/mi</th></tr></thead>
            <tbody>
              {weekLoads.map((load) => (
                <tr key={load.id} className="border-b border-slate-800">
                  <td className="py-2">{load.origin} → {load.destination}</td>
                  <td className="py-2">{load.miles ?? "—"}</td>
                  <td className="py-2 text-right">{load.rate ? formatCurrency(load.rate) : "—"}</td>
                  <td className="py-2 text-right">{load.ratePerMile ? formatCurrency(load.ratePerMile) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="panel p-5">
        <h2 className="mb-4 font-semibold">Expenses by Category</h2>
        {Object.keys(byCategory).length === 0 ? <p className="text-sm text-slate-400">No expenses this week.</p> : (
          <div className="space-y-2">
            {Object.entries(byCategory).sort((a, b) => b[1] - a[1]).map(([category, amount]) => (
              <div key={category} className="flex justify-between text-sm">
                <span>{category}</span><span className="text-red-400">{formatCurrency(amount)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
