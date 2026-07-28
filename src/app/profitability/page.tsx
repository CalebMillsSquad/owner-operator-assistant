import { formatCurrency, formatRatePerMile, formatStatus } from "@/lib/formatters";
import { calculateLoadProfit, calculateRatePerMile, calculateWeeklySummary } from "@/lib/profitability";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ProfitabilityPage() {
  const [loads, expenses] = await Promise.all([
    prisma.load.findMany({
      where: { deletedAt: null },
      include: { expenses: { where: { deletedAt: null } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.expense.findMany({ where: { deletedAt: null }, orderBy: { expenseDate: "desc" } }),
  ]);

  const loadSnapshots = loads.map((load) => ({ load, snapshot: calculateLoadProfit(load) }));
  const totalRevenue = loadSnapshots.reduce((sum, item) => sum + item.snapshot.revenue, 0);
  const totalLinkedExpenses = loadSnapshots.reduce((sum, item) => sum + item.snapshot.linkedExpenseTotal, 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const unassignedExpenses = totalExpenses - totalLinkedExpenses;
  const totalNet = totalRevenue - totalExpenses;
  const milesWithRates = loadSnapshots.reduce((sum, item) => sum + (item.snapshot.totalMiles ?? 0), 0);
  const revenueWithMiles = loadSnapshots
    .filter((item) => item.snapshot.totalMiles !== null)
    .reduce((sum, item) => sum + item.snapshot.revenue, 0);
  const averageRatePerMile = calculateRatePerMile(revenueWithMiles, milesWithRates);
  const weekly = calculateWeeklySummary(loads, expenses);

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Profitability Calculator</h1>
        <p className="mt-1 text-sm text-slate-400">
          Revenue per mile equals load rate divided by miles. Net per load equals load rate minus expenses tied to that load.
        </p>
      </header>

      <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="panel p-5">
          <p className="text-sm text-slate-400">Total Load Revenue</p>
          <p className="mt-2 text-3xl font-semibold">{formatCurrency(totalRevenue)}</p>
          <p className="mt-2 text-xs text-slate-500">{loads.length} recorded loads</p>
        </div>
        <div className="panel p-5">
          <p className="text-sm text-slate-400">Total Expenses</p>
          <p className="mt-2 text-3xl font-semibold">{formatCurrency(totalExpenses)}</p>
          <p className="mt-2 text-xs text-slate-500">{formatCurrency(unassignedExpenses)} unassigned</p>
        </div>
        <div className="panel p-5">
          <p className="text-sm text-slate-400">Estimated Net</p>
          <p className={`mt-2 text-3xl font-semibold ${totalNet >= 0 ? "text-green-400" : "text-red-400"}`}>
            {formatCurrency(totalNet)}
          </p>
          <p className="mt-2 text-xs text-slate-500">All revenue minus all expenses</p>
        </div>
        <div className="panel p-5">
          <p className="text-sm text-slate-400">Average Revenue / Mile</p>
          <p className="mt-2 text-3xl font-semibold">{formatRatePerMile(averageRatePerMile)}</p>
          <p className="mt-2 text-xs text-slate-500">{milesWithRates.toLocaleString()} miles with rates</p>
        </div>
      </section>

      <section className="panel mb-6 p-5">
        <h2 className="mb-4 font-semibold">Current Week Check</h2>
        <div className="grid gap-3 text-sm text-[#324761] md:grid-cols-4">
          <div>
            <p className="text-slate-500">Revenue</p>
            <p className="mt-1 font-semibold">{formatCurrency(weekly.loadRevenue)}</p>
          </div>
          <div>
            <p className="text-slate-500">Expenses</p>
            <p className="mt-1 font-semibold">{formatCurrency(weekly.expenseTotal)}</p>
          </div>
          <div>
            <p className="text-slate-500">Net</p>
            <p className={`mt-1 font-semibold ${weekly.net >= 0 ? "text-green-400" : "text-red-400"}`}>{formatCurrency(weekly.net)}</p>
          </div>
          <div>
            <p className="text-slate-500">Revenue / Mile</p>
            <p className="mt-1 font-semibold">{formatRatePerMile(weekly.revenuePerTotalMile)}</p>
          </div>
        </div>
      </section>

      <section className="panel p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">Net by Load</h2>
          <span className="text-xs text-slate-500">rate - linked expenses</span>
        </div>
        <div className="space-y-3">
          {loadSnapshots.length === 0 ? (
            <p className="text-sm text-slate-500">No loads recorded yet. Add a load with rate and miles to start measuring profitability.</p>
          ) : (
            loadSnapshots.map(({ load, snapshot }) => (
              <div key={load.id} className="surface-row">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="font-medium">
                      {load.origin} to {load.destination}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {formatStatus(load.status)} - {load.broker ?? "Direct"} - {load.commodity ?? "General freight"}
                    </p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className={`font-semibold ${snapshot.net >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {formatCurrency(snapshot.net)}
                    </p>
                    <p className="text-xs text-slate-400">estimated net</p>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 text-xs text-slate-400 sm:grid-cols-4">
                  <span>Rate: {load.rate === null ? "Missing" : formatCurrency(snapshot.revenue)}</span>
                  <span>Miles: {snapshot.totalMiles?.toLocaleString() ?? "Missing"}</span>
                  <span>RPM: {formatRatePerMile(snapshot.revenuePerTotalMile)}</span>
                  <span>Linked expenses: {formatCurrency(snapshot.linkedExpenseTotal)}</span>
                </div>
                {snapshot.missingFields.length > 0 ? (
                  <p className="mt-3 text-xs text-yellow-300">
                    Missing {snapshot.missingFields.join(" and ")} keeps this load from being fully measurable.
                  </p>
                ) : null}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
