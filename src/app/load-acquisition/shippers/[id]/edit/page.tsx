import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { updateShipperLead } from "@/app/actions";
import { formatStatus } from "@/lib/formatters";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const shipperStatuses = ["LEAD", "CONTACTED", "QUALIFIED", "PROPOSAL_SENT", "ACTIVE", "LOST"] as const;

export default async function EditShipperLeadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const shipper = await prisma.shipperLead.findUnique({ where: { id, deletedAt: null } });

  if (!shipper) {
    notFound();
  }

  async function saveShipperLead(formData: FormData) {
    "use server";
    await updateShipperLead(id, formData);
    redirect("/load-acquisition/shippers");
  }

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
      <header className="mb-8">
        <p className="brand-kicker">Edit direct shipper lead</p>
        <h1 className="mt-2 text-2xl font-bold text-[#0a2342]">Edit Shipper Lead</h1>
        <p className="mt-1 max-w-3xl text-sm text-[#6b7c93]">
          Update prospect details, recurring lanes, freight type, and pipeline status.
        </p>
      </header>

      <section className="panel p-5">
        <form action={saveShipperLead} className="grid gap-3">
          <input name="companyName" required className="input" placeholder="Company name" defaultValue={shipper.companyName} />
          <input name="industry" className="input" placeholder="Industry" defaultValue={shipper.industry ?? ""} />
          <input name="contactName" className="input" placeholder="Contact name" defaultValue={shipper.contactName ?? ""} />
          <input name="phone" className="input" placeholder="Phone" defaultValue={shipper.phone ?? ""} />
          <input name="email" type="email" className="input" placeholder="Email" defaultValue={shipper.email ?? ""} />
          <input name="location" className="input" placeholder="Location" defaultValue={shipper.location ?? ""} />
          <input name="recurringLanes" className="input" placeholder="Recurring lanes" defaultValue={shipper.recurringLanes ?? ""} />
          <input name="freightType" className="input" placeholder="Freight type" defaultValue={shipper.freightType ?? ""} />
          <select name="status" required className="input" defaultValue={shipper.status}>
            {shipperStatuses.map((status) => (
              <option key={status} value={status}>
                {formatStatus(status)}
              </option>
            ))}
          </select>
          <textarea name="notes" rows={4} className="input" placeholder="Notes" defaultValue={shipper.notes ?? ""} />
          <div className="flex flex-wrap gap-3">
            <button type="submit" className="btn-primary">
              Save Changes
            </button>
            <Link href="/load-acquisition/shippers" className="btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </section>
    </div>
  );
}
