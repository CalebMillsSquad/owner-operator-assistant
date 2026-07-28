import Link from "next/link";

import { createFuelLogAction, deleteFuelLogAction } from "@/app/actions";
import { ConfirmDeleteButton } from "@/components/ConfirmDeleteButton";
import { FuelPurchaseFields } from "@/components/FuelPurchaseFields";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { summarizeFuelPurchases } from "@/lib/fuel";
import { isInCurrentWeek } from "@/lib/profitability";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function formatFuelLocation(location: string | null, state: string | null) {
  if (!location) {
    return state ?? "Location not recorded";
  }

  if (!state || location.trim().toUpperCase().endsWith(`, ${state.toUpperCase()}`)) {
    return location;
  }

  return `${location}, ${state}`;
}

export default async function FuelPage() {
  const [fuelLogs, loads] = await Promise.all([
    prisma.fuelLog.findMany({
      where: { deletedAt: null },
      include: { load: true, expense: true },
      orderBy: [{ fuelDate: "desc" }, { createdAt: "desc" }],
    }),
    prisma.load.findMany({ where: { deletedAt: null }, orderBy: { createdAt: "desc" } }),
  ]);
  const weeklySummary = summarizeFuelPurchases(fuelLogs.filter((fuelLog) => isInCurrentWeek(fuelLog.fuelDate)));
  const allTimeSummary = summarizeFuelPurchases(fuelLogs);
  const unlinkedCount = fuelLogs.filter((fuelLog) => !fuelLog.expenseId).length;
  const today = new Date().toISOString().slice(0, 10);
  const loadOptions = loads.map((load) => ({
    id: load.id,
    label: `${load.origin} to ${load.destination}${load.loadNumber ? ` (${load.loadNumber})` : ""}`,
  }));

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      <header className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="brand-kicker">Daily operations</p>
          <h1 className="mt-2 text-2xl font-bold">Fuel Purchases</h1>
          <p className="mt-1 max-w-3xl text-sm text-slate-500">
            Capture gallons, price, state, odometer, receipt reference, and load context. Each purchase creates one linked fuel expense for profitability reporting.
          </p>
        </div>
        <Link href="/load-acquisition/fuel-stops" className="btn-secondary self-start lg:self-auto">
          Open Fuel Planning
        </Link>
      </header>

      <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Fuel purchase summary">
        <div className="panel p-5">
          <p className="text-sm text-slate-500">This Week</p>
          <p className="mt-2 text-3xl font-semibold">{formatCurrency(weeklySummary.totalCost)}</p>
          <p className="mt-2 text-xs text-slate-500">{weeklySummary.gallons.toFixed(1)} gallons</p>
        </div>
        <div className="panel p-5">
          <p className="text-sm text-slate-500">Average Price</p>
          <p className="mt-2 text-3xl font-semibold">
            {weeklySummary.averagePricePerGallon === null ? "--" : formatCurrency(weeklySummary.averagePricePerGallon, true)}
          </p>
          <p className="mt-2 text-xs text-slate-500">Weighted by gallons this week</p>
        </div>
        <div className="panel p-5">
          <p className="text-sm text-slate-500">Purchase Records</p>
          <p className="mt-2 text-3xl font-semibold">{allTimeSummary.purchaseCount}</p>
          <p className="mt-2 text-xs text-slate-500">{allTimeSummary.gallons.toFixed(1)} gallons recorded</p>
        </div>
        <div className="panel p-5">
          <p className="text-sm text-slate-500">Financial Linkage</p>
          <p className="mt-2 text-3xl font-semibold">{unlinkedCount === 0 ? "Ready" : unlinkedCount}</p>
          <p className="mt-2 text-xs text-slate-500">{unlinkedCount === 0 ? "All purchases linked to expenses" : "Legacy records need review"}</p>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <section className="panel p-5">
          <h2 className="text-lg font-semibold">Add Fuel Purchase</h2>
          <p className="mt-1 text-sm text-slate-500">Total cost is calculated from gallons multiplied by price per gallon.</p>
          <form action={createFuelLogAction} className="mt-5 grid gap-4">
            <FuelPurchaseFields loads={loadOptions} defaults={{ fuelDate: today }} />
            <button type="submit" className="btn-primary">
              Save Fuel Purchase
            </button>
          </form>
          <p className="mt-4 text-xs leading-5 text-slate-500">
            Fuel records support business and future IFTA review. They do not calculate tax obligations or certify filing accuracy.
          </p>
        </section>

        <section aria-labelledby="fuel-history-heading">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 id="fuel-history-heading" className="text-lg font-semibold">Purchase History</h2>
            <span className="text-sm text-slate-500">{formatCurrency(allTimeSummary.totalCost)} captured</span>
          </div>
          {fuelLogs.length === 0 ? (
            <div className="panel p-6 text-sm text-slate-500">
              No detailed fuel purchases yet. Add the next fuel stop above; existing simple fuel expenses remain available in Expenses.
            </div>
          ) : (
            <div className="space-y-4">
              {fuelLogs.map((fuelLog) => (
                <article key={fuelLog.id} className="panel p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">{fuelLog.vendor ?? "Unknown vendor"}</h3>
                        <span className={fuelLog.expense ? "badge-green" : "badge-yellow"}>
                          {fuelLog.expense ? "Expense linked" : "Legacy record"}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-500">
                        {formatDate(fuelLog.fuelDate)} · {formatFuelLocation(fuelLog.location, fuelLog.state)}
                      </p>
                      <div className="mt-3 grid gap-2 text-sm text-[#324761] sm:grid-cols-3">
                        <span>{fuelLog.gallons.toFixed(3)} gal</span>
                        <span>{formatCurrency(fuelLog.pricePerGallon, true)}/gal</span>
                        <strong>{formatCurrency(fuelLog.totalCost, true)}</strong>
                      </div>
                      <div className="mt-3 space-y-1 text-xs text-slate-500">
                        {fuelLog.load ? <p>Load: {fuelLog.load.origin} to {fuelLog.load.destination}</p> : <p>No load association</p>}
                        {fuelLog.odometer !== null ? <p>Odometer: {fuelLog.odometer.toLocaleString()}</p> : null}
                        <p>{fuelLog.receiptReference ? `Receipt reference: ${fuelLog.receiptReference}` : "Receipt reference missing"}</p>
                        {fuelLog.notes ? <p className="text-[#324761]">{fuelLog.notes}</p> : null}
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <Link href={`/fuel/${fuelLog.id}/edit`} className="btn-secondary">
                        Edit
                      </Link>
                      <form
                        action={async () => {
                          "use server";
                          await deleteFuelLogAction(fuelLog.id);
                        }}
                      >
                        <ConfirmDeleteButton itemName={`fuel purchase from ${fuelLog.vendor ?? "unknown vendor"}`} />
                      </form>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
