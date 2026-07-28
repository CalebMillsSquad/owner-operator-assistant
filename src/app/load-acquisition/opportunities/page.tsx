import Link from "next/link";
import type { Prisma } from "@prisma/client";

import { deleteLoadOpportunity, updateLoadOpportunityStatus } from "@/app/actions";
import { ConfirmDeleteButton } from "@/components/ConfirmDeleteButton";
import { badgeClass, formatCurrency, formatDate, formatStatus } from "@/lib/formatters";
import { formatOpportunityRatePerMile, isOpenOpportunity } from "@/lib/load-acquisition";
import { prisma } from "@/lib/prisma";
import { getEnumSearchParam, type PageSearchParams } from "@/lib/search-params";

export const dynamic = "force-dynamic";

const sourceTypeOptions = ["LOAD_BOARD", "BROKER", "CARRIER_NETWORK", "DIRECT_SHIPPER", "DISPATCH_REFERRAL", "BACKHAUL", "OTHER"] as const;
const statusOptions = ["NEW", "REVIEWING", "CONTACTED", "NEGOTIATING", "BOOKED", "REJECTED", "EXPIRED"] as const;

export default async function OpportunitiesPage({ searchParams }: { searchParams: PageSearchParams }) {
  const params = await searchParams;
  const sourceFilter = getEnumSearchParam(sourceTypeOptions, params.source);
  const statusFilter = getEnumSearchParam(statusOptions, params.status);
  const where: Prisma.LoadOpportunityWhereInput = {
    deletedAt: null,
    ...(sourceFilter ? { sourceType: sourceFilter } : {}),
    ...(statusFilter ? { status: statusFilter } : {}),
  };
  const opportunities = await prisma.loadOpportunity.findMany({ where, orderBy: [{ priority: "desc" }, { updatedAt: "desc" }] });
  const openCount = opportunities.filter(isOpenOpportunity).length;
  const hasFilters = Boolean(sourceFilter || statusFilter);

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="brand-kicker">Load Acquisition</p>
          <h1 className="mt-2 text-2xl font-bold text-[#0a2342]">Load Opportunities</h1>
          <p className="mt-1 text-sm text-[#6b7c93]">
            Track manual leads from load boards, brokers, carrier network referrals, direct shippers, dispatchers, and backhauls.
          </p>
        </div>
        <Link href="/load-acquisition/opportunities/new" className="btn-primary">
          Add Opportunity
        </Link>
      </header>

      <section className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="panel p-5">
          <p className="text-sm text-[#6b7c93]">Open Opportunities</p>
          <p className="mt-2 text-3xl font-semibold">{openCount}</p>
        </div>
        <div className="panel p-5">
          <p className="text-sm text-[#6b7c93]">Total Leads</p>
          <p className="mt-2 text-3xl font-semibold">{opportunities.length}</p>
        </div>
        <div className="panel p-5">
          <p className="text-sm text-[#6b7c93]">Booked From Pipeline</p>
          <p className="mt-2 text-3xl font-semibold">{opportunities.filter((opportunity) => opportunity.status === "BOOKED").length}</p>
        </div>
      </section>

      <section className="panel mb-6 p-4">
        <form action="/load-acquisition/opportunities" className="grid gap-3 md:grid-cols-[1fr_1fr_auto_auto] md:items-center">
          <select name="source" className="input" aria-label="Opportunity source" defaultValue={sourceFilter ?? ""}>
            <option value="">All sources</option>
            {sourceTypeOptions.map((sourceType) => (
              <option key={sourceType} value={sourceType}>
                {formatStatus(sourceType)}
              </option>
            ))}
          </select>
          <select name="status" className="input" aria-label="Opportunity status" defaultValue={statusFilter ?? ""}>
            <option value="">All statuses</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {formatStatus(status)}
              </option>
            ))}
          </select>
          <button type="submit" className="btn-primary">
            Apply Filters
          </button>
          {hasFilters ? (
            <Link href="/load-acquisition/opportunities" className="btn-secondary">
              Clear
            </Link>
          ) : null}
        </form>
      </section>

      <section className="space-y-4">
        {opportunities.length === 0 ? (
          <div className="panel p-5 text-sm text-[#6b7c93]">No opportunities yet. Add a load lead manually to start building the acquisition pipeline.</div>
        ) : (
          opportunities.map((opportunity) => (
            <div key={opportunity.id} className="panel p-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold text-[#0a2342]">
                      {opportunity.origin} to {opportunity.destination}
                    </h2>
                    <span className={badgeClass(opportunity.status)}>{formatStatus(opportunity.status)}</span>
                    <span className={badgeClass(opportunity.priority)}>{formatStatus(opportunity.priority)}</span>
                  </div>
                  <p className="mt-1 text-sm text-[#6b7c93]">
                    {formatStatus(opportunity.sourceType)} - {opportunity.brokerName ?? opportunity.shipperName ?? opportunity.sourceName ?? "Manual lead"}
                  </p>
                  <div className="mt-3 grid gap-2 text-xs text-[#6b7c93] sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
                    <span>Pickup: {formatDate(opportunity.pickupDate)}</span>
                    <span>Delivery: {formatDate(opportunity.deliveryDate)}</span>
                    <span>Rate: {opportunity.rate === null ? "Missing" : formatCurrency(opportunity.rate)}</span>
                    <span>Miles: {opportunity.miles?.toLocaleString() ?? "Missing"}</span>
                    <span>RPM: {formatOpportunityRatePerMile(opportunity.ratePerMile)}</span>
                    <span>Weight: {opportunity.weight?.toLocaleString() ?? "Not set"}</span>
                  </div>
                  <div className="mt-3 grid gap-2 text-xs text-[#6b7c93] sm:grid-cols-2 lg:grid-cols-4">
                    <span>Equipment: {opportunity.equipmentType ?? "Any"}</span>
                    <span>Commodity: {opportunity.commodity ?? "General freight"}</span>
                    <span>Contact: {opportunity.contactName ?? "Not set"}</span>
                    <span>Phone: {opportunity.phone ?? "Not set"}</span>
                  </div>
                  {opportunity.notes ? <p className="mt-3 text-sm text-[#324761]">{opportunity.notes}</p> : null}
                </div>

                <div className="flex flex-wrap gap-2 xl:max-w-sm xl:justify-end">
                  <Link href={`/load-acquisition/opportunities/${opportunity.id}/edit`} className="btn-secondary">
                    Edit
                  </Link>
                  {statusOptions.map((status) => (
                    <form
                      key={status}
                      action={async () => {
                        "use server";
                        await updateLoadOpportunityStatus(opportunity.id, status);
                      }}
                    >
                      <button type="submit" className={status === opportunity.status ? "btn-primary" : "btn-secondary"}>
                        {formatStatus(status)}
                      </button>
                    </form>
                  ))}
                  <form
                    action={async () => {
                      "use server";
                      await deleteLoadOpportunity(opportunity.id);
                    }}
                  >
                    <ConfirmDeleteButton itemName={`load opportunity ${opportunity.origin} to ${opportunity.destination}`} />
                  </form>
                </div>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
