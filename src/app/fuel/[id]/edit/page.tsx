import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { updateFuelLogAction } from "@/app/actions";
import { FuelPurchaseFields } from "@/components/FuelPurchaseFields";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function dateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

export default async function EditFuelPurchasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [fuelLog, loads] = await Promise.all([
    prisma.fuelLog.findUnique({ where: { id, deletedAt: null } }),
    prisma.load.findMany({ where: { deletedAt: null }, orderBy: { createdAt: "desc" } }),
  ]);

  if (!fuelLog) {
    notFound();
  }

  async function saveFuelPurchase(formData: FormData) {
    "use server";
    await updateFuelLogAction(id, formData);
    redirect("/fuel");
  }

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
      <header className="mb-8">
        <p className="brand-kicker">Daily operations</p>
        <h1 className="mt-2 text-2xl font-bold">Edit Fuel Purchase</h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-500">
          Changes here also update the linked fuel expense used by profitability and weekly reporting.
        </p>
      </header>

      <section className="panel p-5">
        <form action={saveFuelPurchase} className="grid gap-5">
          <FuelPurchaseFields
            loads={loads.map((load) => ({
              id: load.id,
              label: `${load.origin} to ${load.destination}${load.loadNumber ? ` (${load.loadNumber})` : ""}`,
            }))}
            defaults={{
              fuelDate: dateInputValue(fuelLog.fuelDate),
              gallons: fuelLog.gallons,
              pricePerGallon: fuelLog.pricePerGallon,
              vendor: fuelLog.vendor ?? undefined,
              location: fuelLog.location ?? undefined,
              state: fuelLog.state ?? undefined,
              odometer: fuelLog.odometer ?? undefined,
              receiptReference: fuelLog.receiptReference ?? undefined,
              loadId: fuelLog.loadId ?? undefined,
              notes: fuelLog.notes ?? undefined,
            }}
          />
          <div className="flex flex-wrap gap-3">
            <button type="submit" className="btn-primary">Save Changes</button>
            <Link href="/fuel" className="btn-secondary">Cancel</Link>
          </div>
        </form>
      </section>
    </div>
  );
}

