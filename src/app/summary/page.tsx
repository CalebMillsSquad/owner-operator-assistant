import { prisma } from "@/lib/prisma";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function formatCurrency(amount: number) {
  return currencyFormatter.format(amount);
}

export default async function SummaryPage() {
  const [loads, expenses] = await Promise.all([
    prisma.load.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.expense.findMany({ orderBy: { expenseDate: "desc" } }),
  ]);

  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const weeklyLoads = loads.filter((load) => new Date(load.createdAt).getTime() >= weekAgo);
  const weeklyExpenses = expenses.filter((expense) => new Date(expense.expenseDate).getTime() >= weekAgo);

  const gross = weeklyLoads.reduce((sum, load) => sum + (load.rate ?? 0), 0);
  const costs = weeklyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const net = gross - costs;

  const categoryTotals = weeklyExpenses.reduce<Record<string, number>>((totals, expense) => {
    totals[expense.category] = (totals[expense.category] ?? 0) + expense.amount;
    return totals;
  }, {});

  return (
    <div className="mx-auto max-w-5xl p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Weekly Income and Expense Summary</h1>
        <p className="mt-1 text-sm text-slate-400">A rolling 7-day look at cash flow and cost drivers.</p>
      </header>

      <section className="mb-8 grid gap-4 md:grid-cols-3">
        <div className="panel p-5">
          <p className="text-sm text-slate-400">Gross Income</p>
          <p className="mt-2 text-3xl font-semibold">{formatCurrency(gross)}</p>
        </div>
        <div className="panel p-5">
          <p className="text-sm text-slate-400">Expenses</p>
          <p className="mt-2 text-3xl font-semibold">{formatCurrency(costs)}</p>
        </div>
        <div className="panel p-5">
          <p className="text-sm text-slate-400">Net</p>
          <p className={`mt-2 text-3xl font-semibold ${net >= 0 ? "text-green-400" : "text-red-400"}`}>
            {formatCurrency(net)}
          </p>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="panel p-5">
          <h2 className="mb-4 font-semibold">Loads This Week</h2>
          <div className="space-y-3">
            {weeklyLoads.length === 0 ? (
              <p className="text-sm text-slate-500">No loads created in the last 7 days.</p>
            ) : (
              weeklyLoads.map((load) => (
                <div key={load.id} className="rounded-lg border border-slate-800 bg-slate-900 p-3">
                  <p className="font-medium">
                    {load.origin} to {load.destination}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {load.status.replaceAll("_", " ")} • ${load.rate?.toFixed(2) ?? "0.00"}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="panel p-5">
          <h2 className="mb-4 font-semibold">Expense Breakdown</h2>
          <div className="space-y-3">
            {Object.entries(categoryTotals).length === 0 ? (
              <p className="text-sm text-slate-500">No expenses logged in the last 7 days.</p>
            ) : (
              Object.entries(categoryTotals)
                .sort((a, b) => b[1] - a[1])
                .map(([category, amount]) => (
                  <div key={category} className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900 p-3">
                    <span className="font-medium">{category}</span>
                    <span>{formatCurrency(amount)}</span>
                  </div>
                ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
