import Link from "next/link";

import { createExpenseAction, deleteExpenseAction } from "@/app/actions";
import { ConfirmDeleteButton } from "@/components/ConfirmDeleteButton";
import { badgeClass, formatCurrency, formatDate, formatStatus } from "@/lib/formatters";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const categories = ["FUEL", "OIL", "TIRES", "REPAIRS", "TOLLS", "SCALES", "PERMITS", "INSURANCE", "FOOD", "OTHER"] as const;

export default async function ExpensesPage({ searchParams }: { searchParams: Promise<{ loadId?: string }> }) {
  const query = await searchParams;
  const [expenses, loads] = await Promise.all([
    prisma.expense.findMany({
      where: { deletedAt: null },
      include: { load: { where: { deletedAt: null } }, fuelLog: true },
      orderBy: { expenseDate: "desc" },
    }),
    prisma.load.findMany({ where: { deletedAt: null }, orderBy: { createdAt: "desc" } }),
  ]);

  const unassignedCount = expenses.filter((expense) => !expense.loadId).length;
  const totalCaptured = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Fuel and Expense Capture</h1>
        <p className="mt-1 text-sm text-slate-400">Log operating costs and tie them back to specific loads when they belong to a trip.</p>
      </header>

      <section className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="panel p-5">
          <p className="text-sm text-slate-400">Total Captured</p>
          <p className="mt-2 text-3xl font-semibold">{formatCurrency(totalCaptured)}</p>
        </div>
        <div className="panel p-5">
          <p className="text-sm text-slate-400">Expense Records</p>
          <p className="mt-2 text-3xl font-semibold">{expenses.length}</p>
        </div>
        <div className="panel p-5">
          <p className="text-sm text-slate-400">Unassigned Expenses</p>
          <p className="mt-2 text-3xl font-semibold">{unassignedCount}</p>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <section className="panel p-5">
          <h2 className="mb-4 font-semibold">Add Expense</h2>
          <form action={createExpenseAction} className="grid gap-3">
            <label className="grid gap-1 text-sm text-slate-500">Category<select name="category" required className="input" aria-label="Expense category">
              <option value="">Category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {formatStatus(category)}
                </option>
              ))}
            </select></label>
            <label className="grid gap-1 text-sm text-slate-500">Amount<input name="amount" type="number" step="0.01" required className="input" placeholder="Amount" /></label>
            <label className="grid gap-1 text-sm text-slate-500">Expense date<input name="expenseDate" type="date" required className="input" /></label>
            <label className="grid gap-1 text-sm text-slate-500">Vendor<input name="vendor" className="input" placeholder="Vendor" /></label>
            <label className="grid gap-1 text-sm text-slate-500">Location<input name="location" className="input" placeholder="Location" /></label>
            <label className="grid gap-1 text-sm text-slate-500">Receipt reference<input name="receiptPath" className="input" placeholder="Optional path, number, or note" /></label>
            <label className="grid gap-1 text-sm text-slate-500">Load reference<select name="loadId" className="input" defaultValue={query.loadId ?? ""}>
              <option value="">Optional load reference</option>
              {loads.map((load) => (
                <option key={load.id} value={load.id}>
                  {load.origin} to {load.destination} ({load.rate ? formatCurrency(load.rate) : "rate missing"})
                </option>
              ))}
            </select></label>
            <label className="grid gap-1 text-sm text-slate-500">Notes<textarea name="notes" rows={3} className="input" placeholder="Notes" /></label>
            <button type="submit" className="btn-primary">
              Save Expense
            </button>
          </form>
        </section>

        <section className="space-y-4">
          {expenses.length === 0 ? (
            <div className="panel p-5 text-sm text-slate-500">
              No expenses recorded yet. Capture fuel, tolls, scales, repairs, and load-specific costs so net profit stays honest.
            </div>
          ) : (
            expenses.map((expense) => (
              <div key={expense.id} className="panel p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold">{formatStatus(expense.category)}</h2>
                      <span className={badgeClass(expense.load ? "CURRENT" : "MISSING")}>
                        {expense.load ? "LINKED" : "UNASSIGNED"}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-400">
                      {formatDate(expense.expenseDate)} - {expense.vendor ?? "Unknown vendor"}
                    </p>
                    {expense.load ? (
                      <p className="mt-1 text-xs text-[#145ea0]">
                        Load: {expense.load.origin} to {expense.load.destination}
                      </p>
                    ) : (
                      <p className="mt-1 text-xs text-yellow-300">Review whether this belongs to a load for better net-per-load math.</p>
                    )}
                    <p className="mt-1 text-xs text-slate-400">
                      {expense.receiptPath ? `Receipt reference: ${expense.receiptPath}` : "Receipt reference missing"}
                    </p>
                    {expense.notes ? <p className="mt-2 text-sm text-[#324761]">{expense.notes}</p> : null}
                  </div>
                  <div className="flex shrink-0 flex-wrap items-start justify-end gap-2">
                    <p className="w-full text-right text-lg font-semibold">{formatCurrency(expense.amount, true)}</p>
                    <Link href={expense.fuelLog ? `/fuel/${expense.fuelLog.id}/edit` : `/expenses/${expense.id}/edit`} className="btn-secondary">
                      Edit
                    </Link>
                    <form
                      action={async () => {
                        "use server";
                        await deleteExpenseAction(expense.id);
                      }}
                    >
                      <ConfirmDeleteButton itemName={`${formatStatus(expense.category).toLowerCase()} expense for ${formatCurrency(expense.amount, true)}`} />
                    </form>
                  </div>
                </div>
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  );
}
