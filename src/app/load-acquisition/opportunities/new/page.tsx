import { redirect } from "next/navigation";
import Link from "next/link";

import { createLoadOpportunity } from "@/app/actions";
import { formatStatus } from "@/lib/formatters";

export const dynamic = "force-dynamic";

const sourceTypes = ["LOAD_BOARD", "BROKER", "CARRIER_NETWORK", "DIRECT_SHIPPER", "DISPATCH_REFERRAL", "BACKHAUL", "OTHER"] as const;
const priorityOptions = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;
const statusOptions = ["NEW", "REVIEWING", "CONTACTED", "NEGOTIATING", "BOOKED", "REJECTED", "EXPIRED"] as const;

async function saveOpportunity(formData: FormData) {
  "use server";
  await createLoadOpportunity(formData);
  redirect("/load-acquisition/opportunities");
}

export default function NewOpportunityPage() {
  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
      <header className="mb-8">
        <p className="brand-kicker">Manual entry</p>
        <h1 className="mt-2 text-2xl font-bold text-[#0a2342]">New Load Opportunity</h1>
        <p className="mt-1 max-w-3xl text-sm text-[#6b7c93]">
          Enter leads manually from load boards, broker calls, direct shipper conversations, referrals, or backhaul notes. No external
          integrations are used.
        </p>
      </header>

      <section className="panel p-5">
        <form action={saveOpportunity} className="grid gap-4">
          <div className="grid gap-3 md:grid-cols-3">
            <select name="sourceType" required className="input" defaultValue="LOAD_BOARD">
              {sourceTypes.map((sourceType) => (
                <option key={sourceType} value={sourceType}>
                  {formatStatus(sourceType)}
                </option>
              ))}
            </select>
            <select name="priority" required className="input" defaultValue="MEDIUM">
              {priorityOptions.map((priority) => (
                <option key={priority} value={priority}>
                  {formatStatus(priority)}
                </option>
              ))}
            </select>
            <select name="status" required className="input" defaultValue="NEW">
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {formatStatus(status)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <input name="origin" required className="input" placeholder="Origin" />
            <input name="destination" required className="input" placeholder="Destination" />
            <input name="sourceName" className="input" placeholder="Source name, board, or referral" />
            <input name="brokerName" className="input" placeholder="Broker name" />
            <input name="shipperName" className="input" placeholder="Shipper name" />
            <input name="contactName" className="input" placeholder="Contact name" />
            <input name="phone" className="input" placeholder="Phone" />
            <input name="email" type="email" className="input" placeholder="Email" />
            <input name="pickupDate" type="date" className="input" aria-label="Pickup date" />
            <input name="deliveryDate" type="date" className="input" aria-label="Delivery date" />
            <input name="equipmentType" className="input" placeholder="Equipment type" />
            <input name="commodity" className="input" placeholder="Commodity" />
            <input name="rate" type="number" step="0.01" className="input" placeholder="Rate" />
            <input name="miles" type="number" step="0.1" className="input" placeholder="Miles" />
            <input name="weight" type="number" step="1" className="input" placeholder="Weight" />
          </div>

          <textarea name="notes" rows={4} className="input" placeholder="Notes, negotiation details, or next follow-up" />

          <div className="flex flex-wrap gap-3">
            <button type="submit" className="btn-primary">
              Save Opportunity
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
