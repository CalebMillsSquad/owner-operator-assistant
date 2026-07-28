import Link from "next/link";
import type { Prisma } from "@prisma/client";

import { createBrokerContact, deleteBrokerContact, updateBrokerContactStatus } from "@/app/actions";
import { ConfirmDeleteButton } from "@/components/ConfirmDeleteButton";
import { badgeClass, formatStatus } from "@/lib/formatters";
import { isActiveBroker } from "@/lib/load-acquisition";
import { prisma } from "@/lib/prisma";
import { getEnumSearchParam, type PageSearchParams } from "@/lib/search-params";

export const dynamic = "force-dynamic";

const relationshipStatuses = ["NEW", "ACTIVE", "PREFERRED", "WATCHLIST", "DO_NOT_USE"] as const;

export default async function BrokersPage({ searchParams }: { searchParams: PageSearchParams }) {
  const params = await searchParams;
  const statusFilter = getEnumSearchParam(relationshipStatuses, params.status);
  const where: Prisma.BrokerContactWhereInput = {
    deletedAt: null,
    ...(statusFilter ? { relationshipStatus: statusFilter } : {}),
  };
  const brokers = await prisma.brokerContact.findMany({ where, orderBy: [{ relationshipStatus: "asc" }, { updatedAt: "desc" }] });
  const activeBrokers = brokers.filter(isActiveBroker);
  const hasFilters = Boolean(statusFilter);

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      <header className="mb-8">
        <p className="brand-kicker">Load Acquisition</p>
        <h1 className="mt-2 text-2xl font-bold text-[#0a2342]">Broker Contacts</h1>
        <p className="mt-1 text-sm text-[#6b7c93]">
          Manage broker relationships, preferred lanes, equipment needs, and payment notes from manual conversations.
        </p>
      </header>

      <section className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="panel p-5">
          <p className="text-sm text-[#6b7c93]">Broker Contacts</p>
          <p className="mt-2 text-3xl font-semibold">{brokers.length}</p>
        </div>
        <div className="panel p-5">
          <p className="text-sm text-[#6b7c93]">Active or Preferred</p>
          <p className="mt-2 text-3xl font-semibold">{activeBrokers.length}</p>
        </div>
        <div className="panel p-5">
          <p className="text-sm text-[#6b7c93]">Watchlist</p>
          <p className="mt-2 text-3xl font-semibold">{brokers.filter((broker) => broker.relationshipStatus === "WATCHLIST").length}</p>
        </div>
      </section>

      <section className="panel mb-6 p-4">
        <form action="/load-acquisition/brokers" className="grid gap-3 md:grid-cols-[1fr_auto_auto] md:items-center">
          <select name="status" className="input" aria-label="Broker status" defaultValue={statusFilter ?? ""}>
            <option value="">All broker statuses</option>
            {relationshipStatuses.map((status) => (
              <option key={status} value={status}>
                {formatStatus(status)}
              </option>
            ))}
          </select>
          <button type="submit" className="btn-primary">
            Apply Filters
          </button>
          {hasFilters ? (
            <Link href="/load-acquisition/brokers" className="btn-secondary">
              Clear
            </Link>
          ) : null}
        </form>
      </section>

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <section className="panel p-5">
          <h2 className="mb-4 font-semibold">Add Broker Contact</h2>
          <form action={createBrokerContact} className="grid gap-3">
            <input name="companyName" required className="input" placeholder="Broker company" />
            <input name="contactName" className="input" placeholder="Contact name" />
            <input name="phone" className="input" placeholder="Phone" />
            <input name="email" type="email" className="input" placeholder="Email" />
            <input name="preferredLanes" className="input" placeholder="Preferred lanes" />
            <input name="equipmentNeeds" className="input" placeholder="Equipment needs" />
            <input name="paymentNotes" className="input" placeholder="Payment notes" />
            <select name="relationshipStatus" required className="input" defaultValue="NEW">
              {relationshipStatuses.map((status) => (
                <option key={status} value={status}>
                  {formatStatus(status)}
                </option>
              ))}
            </select>
            <textarea name="notes" rows={3} className="input" placeholder="Notes" />
            <button type="submit" className="btn-primary">
              Save Broker
            </button>
          </form>
        </section>

        <section className="space-y-4">
          {brokers.length === 0 ? (
            <div className="panel p-5 text-sm text-[#6b7c93]">No broker contacts yet. Add contacts as you build lane-specific relationships.</div>
          ) : (
            brokers.map((broker) => (
              <div key={broker.id} className="panel p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold text-[#0a2342]">{broker.companyName}</h2>
                      <span className={badgeClass(broker.relationshipStatus)}>{formatStatus(broker.relationshipStatus)}</span>
                    </div>
                    <p className="mt-1 text-sm text-[#6b7c93]">
                      {broker.contactName ?? "No contact name"} - {broker.phone ?? "No phone"} - {broker.email ?? "No email"}
                    </p>
                    <div className="mt-3 grid gap-2 text-xs text-[#6b7c93] sm:grid-cols-3">
                      <span>Lanes: {broker.preferredLanes ?? "Not set"}</span>
                      <span>Equipment: {broker.equipmentNeeds ?? "Not set"}</span>
                      <span>Payment: {broker.paymentNotes ?? "Not set"}</span>
                    </div>
                    {broker.notes ? <p className="mt-3 text-sm text-[#324761]">{broker.notes}</p> : null}
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2 md:max-w-sm md:justify-end">
                    <Link href={`/load-acquisition/brokers/${broker.id}/edit`} className="btn-secondary">
                      Edit
                    </Link>
                    {relationshipStatuses.map((status) => (
                      <form
                        key={status}
                        action={async () => {
                          "use server";
                          await updateBrokerContactStatus(broker.id, status);
                        }}
                      >
                        <button type="submit" className={status === broker.relationshipStatus ? "btn-primary" : "btn-secondary"}>
                          {formatStatus(status)}
                        </button>
                      </form>
                    ))}
                    <form
                      action={async () => {
                        "use server";
                        await deleteBrokerContact(broker.id);
                      }}
                    >
                      <ConfirmDeleteButton itemName={`broker contact ${broker.companyName}`} />
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
