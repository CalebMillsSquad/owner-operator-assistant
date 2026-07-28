import Link from "next/link";

import { createSmartFuelStop, deleteSmartFuelStop, togglePreferredFuelStop } from "@/app/actions";
import { ConfirmDeleteButton } from "@/components/ConfirmDeleteButton";
import { badgeClass, formatCurrency } from "@/lib/formatters";
import { formatFuelEstimatedCost } from "@/lib/load-acquisition";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function FuelStopsPage() {
  const fuelStops = await prisma.smartFuelStop.findMany({ where: { deletedAt: null }, orderBy: [{ preferred: "desc" }, { updatedAt: "desc" }] });
  const preferredStops = fuelStops.filter((stop) => stop.preferred);
  const plannedCost = fuelStops.reduce((sum, stop) => sum + (stop.estimatedCost ?? 0), 0);

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      <header className="mb-8">
        <p className="brand-kicker">Load Acquisition</p>
        <h1 className="mt-2 text-2xl font-bold text-[#0a2342]">Smart Fuel Stops</h1>
        <p className="mt-1 text-sm text-[#6b7c93]">
          Plan fuel stops manually by route, gallons, and fuel price before booking or running the load.
        </p>
      </header>

      <p className="mb-6 rounded-lg border border-[#f3d69b] bg-[#fff7e8] p-4 text-sm leading-6 text-[#8a5a00]">
        Fuel and IFTA numbers are planning estimates only. Keep IFTA notes here for awareness, but do not calculate final tax liability in this module.
      </p>

      <section className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="panel p-5">
          <p className="text-sm text-[#6b7c93]">Planned Fuel Stops</p>
          <p className="mt-2 text-3xl font-semibold">{fuelStops.length}</p>
        </div>
        <div className="panel p-5">
          <p className="text-sm text-[#6b7c93]">Preferred Stops</p>
          <p className="mt-2 text-3xl font-semibold">{preferredStops.length}</p>
        </div>
        <div className="panel p-5">
          <p className="text-sm text-[#6b7c93]">Estimated Fuel Cost</p>
          <p className="mt-2 text-3xl font-semibold">{formatFuelEstimatedCost(plannedCost)}</p>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <section className="panel p-5">
          <h2 className="mb-4 font-semibold">Add Fuel Stop</h2>
          <form action={createSmartFuelStop} className="grid gap-3">
            <input name="truckStopName" required className="input" placeholder="Truck stop name" />
            <input name="location" required className="input" placeholder="City or location" />
            <input name="state" className="input" placeholder="State" />
            <input name="routeName" className="input" placeholder="Route or load name" />
            <input name="fuelPrice" type="number" step="0.001" className="input" placeholder="Fuel price" />
            <input name="gallonsPlanned" type="number" step="0.1" className="input" placeholder="Gallons planned" />
            <input name="iftaNote" className="input" placeholder="IFTA note or state note" />
            <label className="flex items-center gap-2 rounded-lg border border-[#dce5ef] bg-white px-3 py-2 text-sm text-[#324761]">
              <input name="preferred" type="checkbox" className="size-4" />
              Preferred stop
            </label>
            <textarea name="notes" rows={3} className="input" placeholder="Notes" />
            <button type="submit" className="btn-primary">
              Save Fuel Stop
            </button>
          </form>
        </section>

        <section className="space-y-4">
          {fuelStops.length === 0 ? (
            <div className="panel p-5 text-sm text-[#6b7c93]">No fuel stops planned yet. Add manual stops to compare route cost estimates.</div>
          ) : (
            fuelStops.map((stop) => (
              <div key={stop.id} className="panel p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold text-[#0a2342]">{stop.truckStopName}</h2>
                      <span className={badgeClass(stop.preferred ? "PREFERRED" : "NEW")}>{stop.preferred ? "PREFERRED" : "PLANNED"}</span>
                    </div>
                    <p className="mt-1 text-sm text-[#6b7c93]">
                      {stop.location}
                      {stop.state ? `, ${stop.state}` : ""} - {stop.routeName ?? "No route assigned"}
                    </p>
                    <div className="mt-3 grid gap-2 text-xs text-[#6b7c93] sm:grid-cols-4">
                      <span>Fuel price: {stop.fuelPrice === null ? "Missing" : formatCurrency(stop.fuelPrice, true)}</span>
                      <span>Gallons: {stop.gallonsPlanned?.toLocaleString() ?? "Missing"}</span>
                      <span>Estimated cost: {formatFuelEstimatedCost(stop.estimatedCost)}</span>
                      <span>IFTA note: {stop.iftaNote ?? "None"}</span>
                    </div>
                    {stop.notes ? <p className="mt-3 text-sm text-[#324761]">{stop.notes}</p> : null}
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2 md:justify-end">
                    <Link href={`/load-acquisition/fuel-stops/${stop.id}/edit`} className="btn-secondary">
                      Edit
                    </Link>
                    <form
                      action={async () => {
                        "use server";
                        await togglePreferredFuelStop(stop.id);
                      }}
                    >
                      <button type="submit" className={stop.preferred ? "btn-primary" : "btn-secondary"}>
                        {stop.preferred ? "Preferred" : "Mark Preferred"}
                      </button>
                    </form>
                    <form
                      action={async () => {
                        "use server";
                        await deleteSmartFuelStop(stop.id);
                      }}
                    >
                      <ConfirmDeleteButton itemName={`fuel stop ${stop.truckStopName}`} />
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
