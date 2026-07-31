import { prisma } from "@/lib/prisma";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function formatCurrency(amount: number) {
  return currencyFormatter.format(amount);
}

export default async function ProfitabilityPage() {
  const [loads, expenses] = await Promise.all([
    prisma.load.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.expense.findMany({ orderBy: { expenseDate: "desc" } }),
  ]);

  const totalRevenue = loads.reduce((sum, load) => sum + (load.rate ?? 0), 0);
  const deliveredRevenue = loads
    .filter((load) => load.status === "DELIVERED")
    .reduce((sum, load) => sum + (load.rate ?? 0), 0);
  const totalMiles = loads.reduce((sum, load) => sum + (load.miles ?? 0), 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const avgRatePerMile = totalMiles > 0 ? totalRevenue / totalMiles : 0;
  const profit = totalRevenue - totalExpenses;
  const costPerLoad = loads.length > 0 ? totalExpenses / loads.length : 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Profitability Calculator</h1>
        <p className="mt-1 text-sm text-slate-400">Use live operating data to monitor margins and revenue quality.</p>
      </header>

      <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="panel p-5">
          <p className="text-sm text-slate-400">Total Revenue</p>
          <p className="mt-2 text-3xl font-semibold">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="panel p-5">
          <p className="text-sm text-slate-400">Delivered Revenue</p>
          <p className="mt-2 text-3xl font-semibold">{formatCurrency(deliveredRevenue)}</p>
        </div>
        <div className="panel p-5">
          <p className="text-sm text-slate-400">Operating Profit</p>
          <p className={`mt-2 text-3xl font-semibold ${profit >= 0 ? "text-green-400" : "text-red-400"}`}>
            {formatCurrency(profit)}
          </p>
        </div>
        <div className="panel p-5">
          <p className="text-sm text-slate-400">Average Rate / Mile</p>
          <p className="mt-2 text-3xl font-semibold">${avgRatePerMile.toFixed(2)}</p>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="panel p-5">
          <h2 className="mb-4 font-semibold">Margin Snapshot</h2>
          <div className="space-y-3 text-sm text-slate-300">
            <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900 p-3">
              <span>Total Expenses</span>
              <span>{formatCurrency(totalExpenses)}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900 p-3">
              <span>Cost per Load</span>
              <span>{formatCurrency(costPerLoad)}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900 p-3">
              <span>Total Miles</span>
              <span>{totalMiles.toLocaleString()}</span>
            </div>
          </div>
        </section>

        <section className="panel p-5">
          <h2 className="mb-4 font-semibold">Revenue by Load</h2>
          <div className="space-y-3">
            {loads.length === 0 ? (
              <p className="text-sm text-slate-500">No loads recorded yet.</p>
            ) : (
              loads.map((load) => (
                <div key={load.id} className="rounded-lg border border-slate-800 bg-slate-900 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">
                        {load.origin} to {load.destination}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">{load.status.replaceAll("_", " ")}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(load.rate ?? 0)}</p>
                      <p className="text-xs text-slate-400">
                        {load.ratePerMile ? `$${load.ratePerMile.toFixed(2)}/mi` : "n/a"}
                      </p>
                    </div>
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
