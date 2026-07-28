import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { updateLoadAction } from "@/app/actions";
import { formatStatus } from "@/lib/formatters";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const statusOptions = ["BOOKED", "IN_TRANSIT", "DELIVERED", "CANCELLED"] as const;

function dateInputValue(date: Date | null) {
  return date ? date.toISOString().slice(0, 10) : "";
}

export default async function EditLoadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const load = await prisma.load.findUnique({ where: { id, deletedAt: null } });

  if (!load) {
    notFound();
  }

  async function saveLoad(formData: FormData) {
    "use server";
    await updateLoadAction(id, formData);
    redirect("/loads");
  }

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
      <header className="mb-8">
        <p className="brand-kicker">Edit active freight</p>
        <h1 className="mt-2 text-2xl font-bold text-white">Edit Load</h1>
        <p className="mt-1 max-w-3xl text-sm text-[#9badc3]">
          Update the lane, status, rate, miles, and notes. Rate per mile recalculates from rate and miles when both are present.
        </p>
      </header>

      <section className="panel p-5">
        <form action={saveLoad} className="grid gap-4">
          <div className="grid gap-3 md:grid-cols-3">
            <input name="loadNumber" className="input" placeholder="Load number" defaultValue={load.loadNumber ?? ""} />
            <select name="status" required className="input" defaultValue={load.status}>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {formatStatus(status)}
                </option>
              ))}
            </select>
            <input name="broker" className="input" placeholder="Broker or customer" defaultValue={load.broker ?? ""} />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <input name="origin" required className="input" placeholder="Origin" defaultValue={load.origin} />
            <input name="destination" required className="input" placeholder="Destination" defaultValue={load.destination} />
            <input name="commodity" className="input" placeholder="Commodity" defaultValue={load.commodity ?? ""} />
            <input name="pickupDate" type="date" className="input" aria-label="Pickup date" defaultValue={dateInputValue(load.pickupDate)} />
            <input name="deliveryDate" type="date" className="input" aria-label="Delivery date" defaultValue={dateInputValue(load.deliveryDate)} />
            <input name="rate" type="number" step="0.01" className="input" placeholder="Rate" defaultValue={load.rate ?? ""} />
            <input name="loadedMiles" type="number" min="0" step="0.1" className="input" placeholder="Loaded miles" defaultValue={load.loadedMiles ?? load.miles ?? ""} />
            <input name="deadheadMiles" type="number" min="0" step="0.1" className="input" placeholder="Deadhead miles" defaultValue={load.deadheadMiles ?? ""} />
          </div>

          <textarea name="notes" rows={4} className="input" placeholder="Notes" defaultValue={load.notes ?? ""} />

          <div className="flex flex-wrap gap-3">
            <button type="submit" className="btn-primary">
              Save Changes
            </button>
            <Link href="/loads" className="btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </section>
    </div>
  );
}
