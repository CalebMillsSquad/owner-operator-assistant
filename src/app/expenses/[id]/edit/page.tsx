import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { updateExpenseAction } from "@/app/actions";
import { formatCurrency, formatStatus } from "@/lib/formatters";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const categories = ["FUEL", "OIL", "TIRES", "REPAIRS", "TOLLS", "SCALES", "PERMITS", "INSURANCE", "FOOD", "OTHER"] as const;

function dateInputValue(date: Date | null) {
  return date ? date.toISOString().slice(0, 10) : "";
}

export default async function EditExpensePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [expense, loads] = await Promise.all([
    prisma.expense.findUnique({ where: { id, deletedAt: null }, include: { fuelLog: true } }),
    prisma.load.findMany({ where: { deletedAt: null }, orderBy: { createdAt: "desc" } }),
  ]);

  if (!expense) {
    notFound();
  }

  if (expense.fuelLog) {
    redirect(`/fuel/${expense.fuelLog.id}/edit`);
  }

  async function saveExpense(formData: FormData) {
    "use server";
    await updateExpenseAction(id, formData);
    redirect("/expenses");
  }

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
      <header className="mb-8">
        <p className="brand-kicker">Edit operating cost</p>
        <h1 className="mt-2 text-2xl font-bold text-white">Edit Expense</h1>
        <p className="mt-1 max-w-3xl text-sm text-[#9badc3]">
          Update amount, category, vendor, notes, and optional load linkage for cleaner net-per-load reporting.
        </p>
      </header>

      <section className="panel p-5">
        <form action={saveExpense} className="grid gap-4">
          <div className="grid gap-3 md:grid-cols-2">
            <select name="category" required className="input" defaultValue={expense.category}>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {formatStatus(category)}
                </option>
              ))}
            </select>
            <input name="amount" type="number" step="0.01" required className="input" placeholder="Amount" defaultValue={expense.amount} />
            <input name="expenseDate" type="date" required className="input" defaultValue={dateInputValue(expense.expenseDate)} />
            <input name="vendor" className="input" placeholder="Vendor" defaultValue={expense.vendor ?? ""} />
            <input name="location" className="input" placeholder="Location" defaultValue={expense.location ?? ""} />
            <select name="loadId" className="input" defaultValue={expense.loadId ?? ""}>
              <option value="">No load reference</option>
              {loads.map((load) => (
                <option key={load.id} value={load.id}>
                  {load.origin} to {load.destination} ({load.rate ? formatCurrency(load.rate) : "rate missing"})
                </option>
              ))}
            </select>
            <input name="receiptPath" className="input md:col-span-2" placeholder="Receipt path or reference" defaultValue={expense.receiptPath ?? ""} />
          </div>

          <textarea name="notes" rows={4} className="input" placeholder="Notes" defaultValue={expense.notes ?? ""} />

          <div className="flex flex-wrap gap-3">
            <button type="submit" className="btn-primary">
              Save Changes
            </button>
            <Link href="/expenses" className="btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </section>
    </div>
  );
}
