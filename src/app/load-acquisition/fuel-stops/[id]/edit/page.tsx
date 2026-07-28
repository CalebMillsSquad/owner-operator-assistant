import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { updateSmartFuelStop } from "@/app/actions";
import { formatFuelEstimatedCost } from "@/lib/load-acquisition";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EditFuelStopPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const fuelStop = await prisma.smartFuelStop.findUnique({ where: { id, deletedAt: null } });

  if (!fuelStop) {
    notFound();
  }

  async function saveFuelStop(formData: FormData) {
    "use server";
    await updateSmartFuelStop(id, formData);
    redirect("/load-acquisition/fuel-stops");
  }

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
      <header className="mb-8">
        <p className="brand-kicker">Edit fuel plan</p>
        <h1 className="mt-2 text-2xl font-bold text-[#0a2342]">Edit Smart Fuel Stop</h1>
        <p className="mt-1 max-w-3xl text-sm text-[#6b7c93]">
          Update planned gallons, fuel price, route notes, and preferred status. Estimated cost recalculates on save.
        </p>
      </header>

      <p className="mb-6 rounded-lg border border-[#f3d69b] bg-[#fff7e8] p-4 text-sm leading-6 text-[#8a5a00]">
        Fuel and IFTA numbers are planning estimates only. Keep IFTA notes here for awareness, but do not calculate final tax liability in this module.
      </p>

      <section className="panel p-5">
        <form action={saveFuelStop} className="grid gap-3">
          <input name="truckStopName" required className="input" placeholder="Truck stop name" defaultValue={fuelStop.truckStopName} />
          <input name="location" required className="input" placeholder="City or location" defaultValue={fuelStop.location} />
          <input name="state" className="input" placeholder="State" defaultValue={fuelStop.state ?? ""} />
          <input name="routeName" className="input" placeholder="Route or load name" defaultValue={fuelStop.routeName ?? ""} />
          <input name="fuelPrice" type="number" step="0.001" className="input" placeholder="Fuel price" defaultValue={fuelStop.fuelPrice ?? ""} />
          <input name="gallonsPlanned" type="number" step="0.1" className="input" placeholder="Gallons planned" defaultValue={fuelStop.gallonsPlanned ?? ""} />
          <input name="iftaNote" className="input" placeholder="IFTA note or state note" defaultValue={fuelStop.iftaNote ?? ""} />
          <label className="flex items-center gap-2 rounded-lg border border-[#dce5ef] bg-white px-3 py-2 text-sm text-[#324761]">
            <input name="preferred" type="checkbox" className="size-4" defaultChecked={fuelStop.preferred} />
            Preferred stop
          </label>
          <p className="text-xs text-[#6b7c93]">Current estimated cost: {formatFuelEstimatedCost(fuelStop.estimatedCost)}</p>
          <textarea name="notes" rows={4} className="input" placeholder="Notes" defaultValue={fuelStop.notes ?? ""} />
          <div className="flex flex-wrap gap-3">
            <button type="submit" className="btn-primary">
              Save Changes
            </button>
            <Link href="/load-acquisition/fuel-stops" className="btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </section>
    </div>
  );
}
