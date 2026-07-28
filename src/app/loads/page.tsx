import Link from "next/link";

import { createLoadAction, deleteLoadAction, updateLoadStatusAction } from "@/app/actions";
import { ConfirmDeleteButton } from "@/components/ConfirmDeleteButton";
import { formatCurrency, formatDate, formatRatePerMile, formatStatus, badgeClass } from "@/lib/formatters";
import { calculateLoadProfit } from "@/lib/profitability";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const statusOptions = ["BOOKED", "IN_TRANSIT", "DELIVERED", "CANCELLED"] as const;

export default async function LoadsPage() {
  const loads = await prisma.load.findMany({
    where: { deletedAt: null },
    include: { expenses: { where: { deletedAt: null } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Load Tracking</h1>
        <p className="mt-1 text-sm text-slate-400">
          Track active freight, capture rate and mileage, and see linked expenses by load.
        </p>
      </header>

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <section className="panel p-5">
          <h2 className="mb-4 font-semibold">Add Load</h2>
          <form action={createLoadAction} className="grid gap-3">
            <input name="origin" required className="input" placeholder="Origin" />
            <input name="destination" required className="input" placeholder="Destination" />
            <input name="broker" className="input" placeholder="Broker or customer" />
            <input name="commodity" className="input" placeholder="Commodity" />
            <input name="pickupDate" type="date" className="input" aria-label="Pickup date" />
            <input name="deliveryDate" type="date" className="input" aria-label="Delivery date" />
            <input name="rate" type="number" step="0.01" className="input" placeholder="Rate" />
            <input name="loadedMiles" type="number" min="0" step="0.1" className="input" placeholder="Loaded miles" />
            <input name="deadheadMiles" type="number" min="0" step="0.1" className="input" placeholder="Deadhead miles" />
            <button type="submit" className="btn-primary">
              Save Load
            </button>
          </form>
        </section>

        <section className="space-y-4">
          {loads.length === 0 ? (
            <div className="panel p-5 text-sm text-slate-500">
              No loads yet. Add the load you are working first, then connect expenses as they happen.
            </div>
          ) : (
            loads.map((load) => {
              const snapshot = calculateLoadProfit(load);
              return (
                <div key={load.id} className="panel p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-semibold">
                          <Link href={`/loads/${load.id}`} className="hover:text-sky-700">{load.origin} to {load.destination}</Link>
                        </h2>
                        <span className={badgeClass(load.status)}>{formatStatus(load.status)}</span>
                      </div>
                      <p className="mt-1 text-sm text-slate-400">
                        {load.broker ?? "Direct"} - {load.commodity ?? "General freight"}
                      </p>
                      <div className="mt-3 grid gap-2 text-xs text-slate-400 sm:grid-cols-2 lg:grid-cols-4">
                        <span>Pickup: {formatDate(load.pickupDate)}</span>
                        <span>Delivery: {formatDate(load.deliveryDate)}</span>
                        <span>Rate: {load.rate === null ? "Missing" : formatCurrency(snapshot.revenue)}</span>
                        <span>Total miles: {snapshot.totalMiles?.toLocaleString() ?? "Missing"}</span>
                        <span>Revenue / total mile: {formatRatePerMile(snapshot.revenuePerTotalMile)}</span>
                        <span>Linked expenses: {formatCurrency(snapshot.linkedExpenseTotal)}</span>
                        <span>Net profit: {formatCurrency(snapshot.net)}</span>
                        <span>Status: {snapshot.status}</span>
                      </div>
                      {snapshot.missingFields.length > 0 ? (
                        <p className="mt-3 text-xs text-yellow-300">
                          Add missing {snapshot.missingFields.join(" and ")} to complete profitability math.
                        </p>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Link href={`/loads/${load.id}/edit`} className="btn-secondary">
                        Edit
                      </Link>
                      {statusOptions.map((status) => (
                        <form
                          key={status}
                          action={async () => {
                            "use server";
                            await updateLoadStatusAction(load.id, status);
                          }}
                        >
                          <button
                            type="submit"
                            className={status === load.status ? "btn-primary" : "btn-secondary"}
                          >
                            {formatStatus(status)}
                          </button>
                        </form>
                      ))}
                      <form
                      action={async () => {
                        "use server";
                        await deleteLoadAction(load.id);
                      }}
                    >
                        <ConfirmDeleteButton itemName={`load ${load.origin} to ${load.destination}`} />
                      </form>
                    </div>
                  </div>

                  <div className="mt-5 border-t border-slate-800 pt-4">
                    <h3 className="mb-3 text-sm font-semibold text-[#0a2342]">Linked Expenses</h3>
                    {load.expenses.length === 0 ? (
                      <p className="text-sm text-slate-500">No expenses are tied to this load yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {load.expenses.map((expense) => (
                          <div key={expense.id} className="flex items-center justify-between gap-3 text-sm text-[#324761]">
                            <span>
                              {formatStatus(expense.category)} - {expense.vendor ?? "Unknown vendor"} - {formatDate(expense.expenseDate)}
                            </span>
                            <span className="font-medium">{formatCurrency(expense.amount)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </section>
      </div>
    </div>
  );
}
