import { createExpenseAction } from "@/app/actions";
import { prisma } from "@/lib/prisma";

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

const CATEGORIES = ["FUEL", "OIL", "TIRES", "REPAIRS", "TOLLS", "SCALES", "PERMITS", "INSURANCE", "FOOD", "OTHER"];

export default async function ExpensesPage() {
  const [expenses, loads] = await Promise.all([
    prisma.expense.findMany({ orderBy: { expenseDate: "desc" }, include: { load: true } }),
    prisma.load.findMany({ where: { status: { in: ["BOOKED", "IN_TRANSIT"] } } }),
  ]);
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="mx-auto max-w-5xl p-8">
      <header className="mb-8"><h1 className="text-2xl font-bold">Expenses</h1><p className="mt-1 text-sm text-slate-400">Total logged: {formatCurrency(total)}</p></header>

      <div className="panel mb-8 p-6">
        <h2 className="mb-4 font-semibold">Log Expense</h2>
        <form action={createExpenseAction} className="grid gap-4 md:grid-cols-3">
          <label className="flex flex-col gap-1 text-sm">Category
            <select name="category" required className="input">
              {CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">Amount ($)<input name="amount" type="number" step="0.01" required className="input" placeholder="0.00" /></label>
          <label className="flex flex-col gap-1 text-sm">Date<input name="expenseDate" type="date" required className="input" defaultValue={new Date().toISOString().split("T")[0]} /></label>
          <label className="flex flex-col gap-1 text-sm">Vendor<input name="vendor" className="input" placeholder="Who did you pay?" /></label>
          <label className="flex flex-col gap-1 text-sm">Linked Load
            <select name="loadId" className="input">
              <option value="">No load</option>
              {loads.map((load) => <option key={load.id} value={load.id}>{load.origin} → {load.destination}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">Notes<input name="notes" className="input" placeholder="Optional notes" /></label>
          <div className="md:col-span-3"><button type="submit" className="btn-primary">Log Expense</button></div>
        </form>
      </div>

      <div className="space-y-2">
        {expenses.length === 0 ? <div className="panel p-5 text-sm text-slate-400">No expenses yet.</div> : expenses.map((expense) => (
          <div key={expense.id} className="panel flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium">{expense.category} — {expense.vendor ?? "No vendor"}</p>
              <p className="text-xs text-slate-400">{new Date(expense.expenseDate).toLocaleDateString()}{expense.load ? ` · Load: ${expense.load.origin} → ${expense.load.destination}` : ""}</p>
            </div>
            <p className="font-semibold text-red-400">{formatCurrency(expense.amount)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
