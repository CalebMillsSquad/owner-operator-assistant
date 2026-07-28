import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { updateLoadOpportunity } from "@/app/actions";
import { formatStatus } from "@/lib/formatters";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const sourceTypes = ["LOAD_BOARD", "BROKER", "CARRIER_NETWORK", "DIRECT_SHIPPER", "DISPATCH_REFERRAL", "BACKHAUL", "OTHER"] as const;
const priorityOptions = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;
const statusOptions = ["NEW", "REVIEWING", "CONTACTED", "NEGOTIATING", "BOOKED", "REJECTED", "EXPIRED"] as const;

function dateInputValue(date: Date | null) {
  return date ? date.toISOString().slice(0, 10) : "";
}

export default async function EditOpportunityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const opportunity = await prisma.loadOpportunity.findUnique({ where: { id, deletedAt: null } });

  if (!opportunity) {
    notFound();
  }

  async function saveOpportunity(formData: FormData) {
    "use server";
    await updateLoadOpportunity(id, formData);
    redirect("/load-acquisition/opportunities");
  }

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
      <header className="mb-8">
        <p className="brand-kicker">Edit manual lead</p>
        <h1 className="mt-2 text-2xl font-bold text-[#0a2342]">Edit Load Opportunity</h1>
        <p className="mt-1 max-w-3xl text-sm text-[#6b7c93]">
          Update the lane, source, contact details, status, and numbers. Rate per mile is recalculated from rate and miles.
        </p>
      </header>

      <section className="panel p-5">
        <form action={saveOpportunity} className="grid gap-4">
          <div className="grid gap-3 md:grid-cols-3">
            <select name="sourceType" required className="input" defaultValue={opportunity.sourceType}>
              {sourceTypes.map((sourceType) => (
                <option key={sourceType} value={sourceType}>
                  {formatStatus(sourceType)}
                </option>
              ))}
            </select>
            <select name="priority" required className="input" defaultValue={opportunity.priority}>
              {priorityOptions.map((priority) => (
                <option key={priority} value={priority}>
                  {formatStatus(priority)}
                </option>
              ))}
            </select>
            <select name="status" required className="input" defaultValue={opportunity.status}>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {formatStatus(status)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <input name="origin" required className="input" placeholder="Origin" defaultValue={opportunity.origin} />
            <input name="destination" required className="input" placeholder="Destination" defaultValue={opportunity.destination} />
            <input name="sourceName" className="input" placeholder="Source name, board, or referral" defaultValue={opportunity.sourceName ?? ""} />
            <input name="brokerName" className="input" placeholder="Broker name" defaultValue={opportunity.brokerName ?? ""} />
            <input name="shipperName" className="input" placeholder="Shipper name" defaultValue={opportunity.shipperName ?? ""} />
            <input name="contactName" className="input" placeholder="Contact name" defaultValue={opportunity.contactName ?? ""} />
            <input name="phone" className="input" placeholder="Phone" defaultValue={opportunity.phone ?? ""} />
            <input name="email" type="email" className="input" placeholder="Email" defaultValue={opportunity.email ?? ""} />
            <input name="pickupDate" type="date" className="input" aria-label="Pickup date" defaultValue={dateInputValue(opportunity.pickupDate)} />
            <input name="deliveryDate" type="date" className="input" aria-label="Delivery date" defaultValue={dateInputValue(opportunity.deliveryDate)} />
            <input name="equipmentType" className="input" placeholder="Equipment type" defaultValue={opportunity.equipmentType ?? ""} />
            <input name="commodity" className="input" placeholder="Commodity" defaultValue={opportunity.commodity ?? ""} />
            <input name="rate" type="number" step="0.01" className="input" placeholder="Rate" defaultValue={opportunity.rate ?? ""} />
            <input name="miles" type="number" step="0.1" className="input" placeholder="Miles" defaultValue={opportunity.miles ?? ""} />
            <input name="weight" type="number" step="1" className="input" placeholder="Weight" defaultValue={opportunity.weight ?? ""} />
          </div>

          <textarea name="notes" rows={4} className="input" placeholder="Notes, negotiation details, or next follow-up" defaultValue={opportunity.notes ?? ""} />

          <div className="flex flex-wrap gap-3">
            <button type="submit" className="btn-primary">
              Save Changes
            </button>
            <Link href="/load-acquisition/opportunities" className="btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </section>
    </div>
  );
}
