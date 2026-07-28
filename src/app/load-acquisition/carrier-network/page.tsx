import Link from "next/link";

import { badgeClass, formatCurrency, formatStatus } from "@/lib/formatters";
import { formatOpportunityRatePerMile } from "@/lib/load-acquisition";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CarrierNetworkPage() {
  const carrierOpportunities = await prisma.loadOpportunity.findMany({
    where: { deletedAt: null, sourceType: { in: ["CARRIER_NETWORK", "DISPATCH_REFERRAL"] } },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      <header className="mb-8">
        <p className="brand-kicker">Load Acquisition</p>
        <h1 className="mt-2 text-2xl font-bold text-[#0a2342]">Carrier Network Opportunities</h1>
        <p className="mt-1 max-w-3xl text-sm text-[#6b7c93]">
          This is the manual planning area for future carrier-sharing and referral workflows. For now, enter every carrier or
          dispatcher referral as a normal load opportunity and track it here.
        </p>
      </header>

      <section className="panel mb-6 p-5">
        <p className="brand-kicker">Future workflow</p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="surface-row">
            <p className="font-bold text-[#0a2342]">1. Receive a referral</p>
            <p className="mt-2 text-sm text-[#6b7c93]">A trusted carrier, dispatcher, or partner shares a lane by phone, text, or manual note.</p>
          </div>
          <div className="surface-row">
            <p className="font-bold text-[#0a2342]">2. Review fit</p>
            <p className="mt-2 text-sm text-[#6b7c93]">Compare rate, miles, equipment, pickup window, and broker/shipper details before contacting anyone.</p>
          </div>
          <div className="surface-row">
            <p className="font-bold text-[#0a2342]">3. Track outcome</p>
            <p className="mt-2 text-sm text-[#6b7c93]">Move the opportunity through contacted, negotiating, booked, rejected, or expired.</p>
          </div>
        </div>
        <div className="mt-4">
          <Link href="/load-acquisition/opportunities/new" className="btn-primary">
            Add Referral Opportunity
          </Link>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-[#0a2342]">Carrier and Dispatch Referrals</h2>
          <span className="text-sm text-[#6b7c93]">{carrierOpportunities.length} records</span>
        </div>
        {carrierOpportunities.length === 0 ? (
          <div className="panel p-5 text-sm text-[#6b7c93]">No carrier-network or dispatch-referral opportunities have been entered yet.</div>
        ) : (
          carrierOpportunities.map((opportunity) => (
            <div key={opportunity.id} className="panel p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-[#0a2342]">
                      {opportunity.origin} to {opportunity.destination}
                    </h3>
                    <span className={badgeClass(opportunity.status)}>{formatStatus(opportunity.status)}</span>
                    <span className={badgeClass(opportunity.priority)}>{formatStatus(opportunity.priority)}</span>
                  </div>
                  <p className="mt-1 text-sm text-[#6b7c93]">
                    {formatStatus(opportunity.sourceType)} - {opportunity.sourceName ?? opportunity.contactName ?? "Manual referral"}
                  </p>
                  <div className="mt-3 grid gap-2 text-xs text-[#6b7c93] sm:grid-cols-3">
                    <span>Rate: {opportunity.rate === null ? "Missing" : formatCurrency(opportunity.rate)}</span>
                    <span>Miles: {opportunity.miles?.toLocaleString() ?? "Missing"}</span>
                    <span>RPM: {formatOpportunityRatePerMile(opportunity.ratePerMile)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
