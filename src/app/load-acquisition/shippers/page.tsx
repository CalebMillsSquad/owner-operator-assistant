import Link from "next/link";
import type { Prisma } from "@prisma/client";

import { createShipperLead, deleteShipperLead, updateShipperLeadStatus } from "@/app/actions";
import { ConfirmDeleteButton } from "@/components/ConfirmDeleteButton";
import { badgeClass, formatStatus } from "@/lib/formatters";
import { isDirectShipperLead } from "@/lib/load-acquisition";
import { prisma } from "@/lib/prisma";
import { getEnumSearchParam, type PageSearchParams } from "@/lib/search-params";

export const dynamic = "force-dynamic";

const shipperStatuses = ["LEAD", "CONTACTED", "QUALIFIED", "PROPOSAL_SENT", "ACTIVE", "LOST"] as const;

export default async function ShippersPage({ searchParams }: { searchParams: PageSearchParams }) {
  const params = await searchParams;
  const statusFilter = getEnumSearchParam(shipperStatuses, params.status);
  const where: Prisma.ShipperLeadWhereInput = {
    deletedAt: null,
    ...(statusFilter ? { status: statusFilter } : {}),
  };
  const shippers = await prisma.shipperLead.findMany({ where, orderBy: [{ status: "asc" }, { updatedAt: "desc" }] });
  const activePipeline = shippers.filter(isDirectShipperLead);
  const hasFilters = Boolean(statusFilter);

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      <header className="mb-8">
        <p className="brand-kicker">Load Acquisition</p>
        <h1 className="mt-2 text-2xl font-bold text-[#0a2342]">Direct Shipper Leads</h1>
        <p className="mt-1 text-sm text-[#6b7c93]">
          Build a manual pipeline of shipper prospects, recurring lanes, freight types, and contact status.
        </p>
      </header>

      <section className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="panel p-5">
          <p className="text-sm text-[#6b7c93]">Shipper Leads</p>
          <p className="mt-2 text-3xl font-semibold">{shippers.length}</p>
        </div>
        <div className="panel p-5">
          <p className="text-sm text-[#6b7c93]">Active Pipeline</p>
          <p className="mt-2 text-3xl font-semibold">{activePipeline.length}</p>
        </div>
        <div className="panel p-5">
          <p className="text-sm text-[#6b7c93]">Active Customers</p>
          <p className="mt-2 text-3xl font-semibold">{shippers.filter((shipper) => shipper.status === "ACTIVE").length}</p>
        </div>
      </section>

      <section className="panel mb-6 p-4">
        <form action="/load-acquisition/shippers" className="grid gap-3 md:grid-cols-[1fr_auto_auto] md:items-center">
          <select name="status" className="input" aria-label="Shipper status" defaultValue={statusFilter ?? ""}>
            <option value="">All shipper statuses</option>
            {shipperStatuses.map((status) => (
              <option key={status} value={status}>
                {formatStatus(status)}
              </option>
            ))}
          </select>
          <button type="submit" className="btn-primary">
            Apply Filters
          </button>
          {hasFilters ? (
            <Link href="/load-acquisition/shippers" className="btn-secondary">
              Clear
            </Link>
          ) : null}
        </form>
      </section>

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <section className="panel p-5">
          <h2 className="mb-4 font-semibold">Add Shipper Lead</h2>
          <form action={createShipperLead} className="grid gap-3">
            <input name="companyName" required className="input" placeholder="Company name" />
            <input name="industry" className="input" placeholder="Industry" />
            <input name="contactName" className="input" placeholder="Contact name" />
            <input name="phone" className="input" placeholder="Phone" />
            <input name="email" type="email" className="input" placeholder="Email" />
            <input name="location" className="input" placeholder="Location" />
            <input name="recurringLanes" className="input" placeholder="Recurring lanes" />
            <input name="freightType" className="input" placeholder="Freight type" />
            <select name="status" required className="input" defaultValue="LEAD">
              {shipperStatuses.map((status) => (
                <option key={status} value={status}>
                  {formatStatus(status)}
                </option>
              ))}
            </select>
            <textarea name="notes" rows={3} className="input" placeholder="Notes" />
            <button type="submit" className="btn-primary">
              Save Shipper Lead
            </button>
          </form>
        </section>

        <section className="space-y-4">
          {shippers.length === 0 ? (
            <div className="panel p-5 text-sm text-[#6b7c93]">No shipper leads yet. Add prospects manually as you research direct freight lanes.</div>
          ) : (
            shippers.map((shipper) => (
              <div key={shipper.id} className="panel p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold text-[#0a2342]">{shipper.companyName}</h2>
                      <span className={badgeClass(shipper.status)}>{formatStatus(shipper.status)}</span>
                    </div>
                    <p className="mt-1 text-sm text-[#6b7c93]">
                      {shipper.industry ?? "Industry not set"} - {shipper.location ?? "Location not set"}
                    </p>
                    <div className="mt-3 grid gap-2 text-xs text-[#6b7c93] sm:grid-cols-4">
                      <span>Contact: {shipper.contactName ?? "Not set"}</span>
                      <span>Phone: {shipper.phone ?? "Not set"}</span>
                      <span>Email: {shipper.email ?? "Not set"}</span>
                      <span>Freight: {shipper.freightType ?? "Not set"}</span>
                    </div>
                    <p className="mt-2 text-xs text-[#6b7c93]">Recurring lanes: {shipper.recurringLanes ?? "Not set"}</p>
                    {shipper.notes ? <p className="mt-3 text-sm text-[#324761]">{shipper.notes}</p> : null}
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2 md:max-w-sm md:justify-end">
                    <Link href={`/load-acquisition/shippers/${shipper.id}/edit`} className="btn-secondary">
                      Edit
                    </Link>
                    {shipperStatuses.map((status) => (
                      <form
                        key={status}
                        action={async () => {
                          "use server";
                          await updateShipperLeadStatus(shipper.id, status);
                        }}
                      >
                        <button type="submit" className={status === shipper.status ? "btn-primary" : "btn-secondary"}>
                          {formatStatus(status)}
                        </button>
                      </form>
                    ))}
                    <form
                      action={async () => {
                        "use server";
                        await deleteShipperLead(shipper.id);
                      }}
                    >
                      <ConfirmDeleteButton itemName={`shipper lead ${shipper.companyName}`} />
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
