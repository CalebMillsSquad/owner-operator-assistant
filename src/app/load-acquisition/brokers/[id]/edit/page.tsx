import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { updateBrokerContact } from "@/app/actions";
import { formatStatus } from "@/lib/formatters";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const relationshipStatuses = ["NEW", "ACTIVE", "PREFERRED", "WATCHLIST", "DO_NOT_USE"] as const;

export default async function EditBrokerContactPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const broker = await prisma.brokerContact.findUnique({ where: { id, deletedAt: null } });

  if (!broker) {
    notFound();
  }

  async function saveBrokerContact(formData: FormData) {
    "use server";
    await updateBrokerContact(id, formData);
    redirect("/load-acquisition/brokers");
  }

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
      <header className="mb-8">
        <p className="brand-kicker">Edit broker contact</p>
        <h1 className="mt-2 text-2xl font-bold text-[#0a2342]">Edit Broker</h1>
        <p className="mt-1 max-w-3xl text-sm text-[#6b7c93]">
          Update broker relationship details, preferred lanes, equipment needs, and payment notes.
        </p>
      </header>

      <section className="panel p-5">
        <form action={saveBrokerContact} className="grid gap-3">
          <input name="companyName" required className="input" placeholder="Broker company" defaultValue={broker.companyName} />
          <input name="contactName" className="input" placeholder="Contact name" defaultValue={broker.contactName ?? ""} />
          <input name="phone" className="input" placeholder="Phone" defaultValue={broker.phone ?? ""} />
          <input name="email" type="email" className="input" placeholder="Email" defaultValue={broker.email ?? ""} />
          <input name="preferredLanes" className="input" placeholder="Preferred lanes" defaultValue={broker.preferredLanes ?? ""} />
          <input name="equipmentNeeds" className="input" placeholder="Equipment needs" defaultValue={broker.equipmentNeeds ?? ""} />
          <input name="paymentNotes" className="input" placeholder="Payment notes" defaultValue={broker.paymentNotes ?? ""} />
          <select name="relationshipStatus" required className="input" defaultValue={broker.relationshipStatus}>
            {relationshipStatuses.map((status) => (
              <option key={status} value={status}>
                {formatStatus(status)}
              </option>
            ))}
          </select>
          <textarea name="notes" rows={4} className="input" placeholder="Notes" defaultValue={broker.notes ?? ""} />
          <div className="flex flex-wrap gap-3">
            <button type="submit" className="btn-primary">
              Save Changes
            </button>
            <Link href="/load-acquisition/brokers" className="btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </section>
    </div>
  );
}
