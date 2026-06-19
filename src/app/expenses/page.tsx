import { createExpenseAction } from "@/app/actions";
import { prisma } from "@/lib/prisma";

const categories = ["FUEL", "OIL", "TIRES", "REPAIRS", "TOLLS", "SCALES", "PERMITS", "INSURANCE", "FOOD", "OTHER"] as const;

export default async function ExpensesPage() {
  const [expenses, loads] = await Promise.all([
    prisma.expense.findMany({ include: { load: true }, orderBy: { expenseDate: "desc" } }),
    prisma.load.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <div className="mx-auto max-w-6xl p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Fuel and Expense Capture</h1>
        <p className="mt-1 text-sm text-slate-400">Log operating costs and tie them back to specific loads.</p>
      </header>

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <section className="panel p-5">
          <h2 className="mb-4 font-semibold">Add Expense</h2>
          <form action={createExpenseAction} className="grid gap-3">
            <select name="category" required className="input">
              <option value="">Category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <input name="amount" type="number" step="0.01" required className="input" placeholder="Amount" />
            <input name="expenseDate" type="date" required className="input" />
            <input name="vendor" className="input" placeholder="Vendor" />
            <select name="loadId" className="input">
              <option value="">Optional load reference</option>
              {loads.map((load) => (
                <option key={load.id} value={load.id}>
                  {load.origin} to {load.destination}
                </option>
              ))}
            </select>
            <textarea name="notes" rows={3} className="input" placeholder="Notes" />
            <button type="submit" className="btn-primary">
              Save Expense
            </button>
          </form>
        </section>

        <section className="space-y-4">
          {expenses.length === 0 ? (
            <div className="panel p-5 text-sm text-slate-500">No expenses recorded yet.</div>
          ) : (
            expenses.map((expense) => (
              <div key={expense.id} className="panel p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold">{expense.category}</h2>
                    <p className="mt-1 text-sm text-slate-400">
                      {new Date(expense.expenseDate).toLocaleDateString()} • {expense.vendor ?? "Unknown vendor"}
                    </p>
                    {expense.load ? (
                      <p className="mt-1 text-xs text-blue-400">
                        Load: {expense.load.origin} to {expense.load.destination}
                      </p>
                    ) : null}
                    {expense.notes ? <p className="mt-2 text-sm text-slate-300">{expense.notes}</p> : null}
                  </div>
                  <p className="text-lg font-semibold">${expense.amount.toFixed(2)}</p>
                </div>
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  );
}
