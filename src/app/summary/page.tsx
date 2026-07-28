import Link from "next/link";
import { formatCurrency, formatDate, formatRatePerMile, formatStatus } from "@/lib/formatters";
import { calculateLoadProfit, calculateWeeklySummary } from "@/lib/profitability";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function hasReceiptReference(receiptPath: string | null) {
  return Boolean(receiptPath?.trim());
}

export default async function SummaryPage({ searchParams }: { searchParams: Promise<{ week?: string }> }) {
  const query = await searchParams;
  const selectedDate = query.week ? new Date(`${query.week}T12:00:00`) : new Date();
  const summaryNow = Number.isNaN(selectedDate.getTime()) ? new Date() : selectedDate;
  const [loads, expenses] = await Promise.all([
    prisma.load.findMany({
      where: { deletedAt: null },
      include: { expenses: { where: { deletedAt: null } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.expense.findMany({ where: { deletedAt: null }, orderBy: { expenseDate: "desc" } }),
  ]);

  const weekly = calculateWeeklySummary(loads, expenses, summaryNow);
  const previousWeek = new Date(weekly.start); previousWeek.setDate(previousWeek.getDate() - 7);
  const nextWeek = new Date(weekly.start); nextWeek.setDate(nextWeek.getDate() + 7);
  const weekEndDisplay = new Date(weekly.end.getTime() - 1);
  const weeklyExpensesWithReceiptReference = weekly.expenses.filter((expense) => hasReceiptReference(expense.receiptPath));
  const weeklyExpensesMissingReceiptReference = weekly.expenses.length - weeklyExpensesWithReceiptReference.length;
  const allExpensesWithReceiptReference = expenses.filter((expense) => hasReceiptReference(expense.receiptPath));
  const totalReceiptCoveragePercent =
    expenses.length > 0 ? Math.round((allExpensesWithReceiptReference.length / expenses.length) * 100) : 0;

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Weekly Income and Expense Summary</h1>
        <p className="mt-1 text-sm text-slate-400">{formatDate(weekly.start)} through {formatDate(weekEndDisplay)}. Revenue uses delivery date, then pickup date, then creation date; expenses use expense date.</p>
        <nav className="mt-4 flex flex-wrap gap-2" aria-label="Week navigation">
          <Link className="btn-secondary" href={`/summary?week=${previousWeek.toISOString().slice(0, 10)}`}>Previous week</Link>
          <Link className="btn-secondary" href="/summary">Current week</Link>
          <Link className="btn-secondary" href={`/summary?week=${nextWeek.toISOString().slice(0, 10)}`}>Next week</Link>
        </nav>
      </header>

      <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="panel p-5">
          <p className="text-sm text-slate-400">Load Revenue</p>
          <p className="mt-2 text-3xl font-semibold">{formatCurrency(weekly.loadRevenue)}</p>
          <p className="mt-2 text-xs text-slate-500">{weekly.loads.length} loads counted</p>
        </div>
        <div className="panel p-5">
          <p className="text-sm text-slate-400">Expenses</p>
          <p className="mt-2 text-3xl font-semibold">{formatCurrency(weekly.expenseTotal)}</p>
          <p className="mt-2 text-xs text-slate-500">{weekly.expenses.length} expenses counted</p>
        </div>
        <div className="panel p-5">
          <p className="text-sm text-slate-400">Estimated Net</p>
          <p className={`mt-2 text-3xl font-semibold ${weekly.net >= 0 ? "text-green-400" : "text-red-400"}`}>
            {formatCurrency(weekly.net)}
          </p>
          <p className="mt-2 text-xs text-slate-500">Revenue minus expenses</p>
        </div>
        <div className="panel p-5">
          <p className="text-sm text-slate-400">Revenue / Mile</p>
          <p className="mt-2 text-3xl font-semibold">{formatRatePerMile(weekly.revenuePerTotalMile)}</p>
          <p className="mt-2 text-xs text-slate-500">{weekly.totalMiles.toLocaleString()} total miles</p>
        </div>
      </section>

      <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="panel p-4"><p className="text-xs text-slate-500">Fuel expense</p><p className="mt-1 font-semibold">{formatCurrency(weekly.fuelExpenseTotal)}</p></div>
        <div className="panel p-4"><p className="text-xs text-slate-500">Other expenses</p><p className="mt-1 font-semibold">{formatCurrency(weekly.otherExpenseTotal)}</p></div>
        <div className="panel p-4"><p className="text-xs text-slate-500">Operating margin</p><p className="mt-1 font-semibold">{weekly.operatingMargin === null ? "Not available" : `${weekly.operatingMargin.toFixed(1)}%`}</p></div>
        <div className="panel p-4"><p className="text-xs text-slate-500">Loaded / deadhead miles</p><p className="mt-1 font-semibold">{weekly.totalLoadedMiles.toLocaleString()} / {weekly.totalDeadheadMiles.toLocaleString()}</p></div>
        <div className="panel p-4"><p className="text-xs text-slate-500">Completed loads</p><p className="mt-1 font-semibold">{weekly.completedLoadCount}</p></div>
      </section>

      <section className="mb-8 grid gap-4 md:grid-cols-3">
        <div className="panel p-5">
          <p className="text-sm text-slate-400">Weekly Receipt References</p>
          <p className="mt-2 text-3xl font-semibold">
            {weeklyExpensesWithReceiptReference.length}/{weekly.expenses.length}
          </p>
          <p className="mt-2 text-xs text-slate-500">Expense records with a reference note this week</p>
        </div>
        <div className="panel p-5">
          <p className="text-sm text-slate-400">Missing This Week</p>
          <p className={`mt-2 text-3xl font-semibold ${weeklyExpensesMissingReceiptReference > 0 ? "text-yellow-300" : "text-green-400"}`}>
            {weeklyExpensesMissingReceiptReference}
          </p>
          <p className="mt-2 text-xs text-slate-500">Add path, folder tag, receipt number, or note in Expenses</p>
        </div>
        <div className="panel p-5">
          <p className="text-sm text-slate-400">All-Time Reference Coverage</p>
          <p className="mt-2 text-3xl font-semibold">{totalReceiptCoveragePercent}%</p>
          <p className="mt-2 text-xs text-slate-500">
            {allExpensesWithReceiptReference.length} of {expenses.length} active expense records
          </p>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="panel p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Loads This Week</h2>
            <span className="text-xs text-slate-500">{weekly.loads.length} loads</span>
          </div>
          <div className="space-y-3">
            {weekly.loads.length === 0 ? (
              <p className="text-sm text-slate-500">
                No loads are dated in the current week yet. Add pickup or delivery dates for a clearer weekly picture.
              </p>
            ) : (
              weekly.loads.map((load) => {
                const snapshot = calculateLoadProfit(load);
                return (
                  <div key={load.id} className="surface-row">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">
                          {load.origin} to {load.destination}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {formatStatus(load.status)} - {formatDate(load.deliveryDate ?? load.pickupDate ?? load.createdAt)}
                        </p>
                      </div>
                      <p className="font-semibold">{formatCurrency(snapshot.revenue)}</p>
                    </div>
                    <div className="mt-3 grid gap-2 text-xs text-slate-400 sm:grid-cols-3">
                      <span>Miles: {snapshot.totalMiles?.toLocaleString() ?? "Missing"}</span>
                      <span>RPM: {formatRatePerMile(snapshot.revenuePerTotalMile)}</span>
                      <span>Linked expense net: {formatCurrency(snapshot.net)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section className="panel p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Largest Expense Categories</h2>
            <span className="text-xs text-slate-500">current week</span>
          </div>
          <div className="space-y-3">
            {weekly.categoryTotals.length === 0 ? (
              <p className="text-sm text-slate-500">No expenses logged this week.</p>
            ) : (
              weekly.categoryTotals.slice(0, 5).map((item) => (
                <div key={item.category} className="surface-row flex items-center justify-between">
                  <span className="font-medium">{formatStatus(item.category)}</span>
                  <span>{formatCurrency(item.amount)}</span>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="panel p-5 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Expense Records This Week</h2>
            <span className="text-xs text-slate-500">{weekly.expenses.length} records</span>
          </div>
          <div className="space-y-2">
            {weekly.expenses.length === 0 ? (
              <p className="text-sm text-slate-500">No weekly expense records yet.</p>
            ) : (
              weekly.expenses.map((expense) => (
                <div key={expense.id} className="surface-row flex flex-col justify-between gap-2 text-sm text-[#324761] md:flex-row md:items-center">
                  <div>
                    <p>
                      {formatStatus(expense.category)} - {expense.vendor ?? "Unknown vendor"} - {formatDate(expense.expenseDate)} - {expense.loadId ? "Linked to load" : "Unassigned"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {hasReceiptReference(expense.receiptPath)
                        ? `Receipt reference: ${expense.receiptPath}`
                        : "Receipt reference missing"}
                    </p>
                  </div>
                  <span className="font-semibold">{formatCurrency(expense.amount)}</span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
