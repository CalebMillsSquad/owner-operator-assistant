import Link from "next/link";

import { badgeClass, formatCurrency, formatStatus } from "@/lib/formatters";
import {
  buildAcquisitionSummary,
  formatFuelEstimatedCost,
  formatOpportunityRatePerMile,
  isHotMarket,
  isOpenOpportunity,
} from "@/lib/load-acquisition";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function DashboardCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="metric-card">
      <p className="metric-label">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-[#0a2342]">{value}</p>
      <p className="mt-2 text-xs text-[#6b7c93]">{detail}</p>
    </div>
  );
}

const commandLinks = [
  { href: "/load-acquisition/opportunities", label: "Opportunities", detail: "Review every possible load source." },
  { href: "/load-acquisition/opportunities/new", label: "New Opportunity", detail: "Manually enter a load lead." },
  { href: "/load-acquisition/markets", label: "Hot Markets", detail: "Track lanes and regions showing demand." },
  { href: "/load-acquisition/lanes", label: "Lane Intelligence", detail: "Review recurring lanes from existing local records." },
  { href: "/load-acquisition/brokers", label: "Brokers", detail: "Manage contacts, lanes, and relationship status." },
  { href: "/load-acquisition/carrier-network", label: "Carrier Network", detail: "Plan future carrier-sharing and referrals." },
  { href: "/load-acquisition/shippers", label: "Direct Shippers", detail: "Build shipper lead pipeline." },
  { href: "/load-acquisition/fuel-stops", label: "Smart Fuel Stops", detail: "Estimate planned fuel buys and IFTA notes." },
];

export default async function LoadAcquisitionPage() {
  const [opportunities, marketSignals, brokerContacts, shipperLeads, fuelStops] = await Promise.all([
    prisma.loadOpportunity.findMany({ where: { deletedAt: null }, orderBy: { updatedAt: "desc" } }),
    prisma.marketSignal.findMany({ where: { deletedAt: null }, orderBy: [{ demandLevel: "desc" }, { updatedAt: "desc" }] }),
    prisma.brokerContact.findMany({ where: { deletedAt: null }, orderBy: { updatedAt: "desc" } }),
    prisma.shipperLead.findMany({ where: { deletedAt: null }, orderBy: { updatedAt: "desc" } }),
    prisma.smartFuelStop.findMany({ where: { deletedAt: null }, orderBy: [{ preferred: "desc" }, { updatedAt: "desc" }] }),
  ]);

  const summary = buildAcquisitionSummary({ opportunities, marketSignals, brokerContacts, shipperLeads, fuelStops });
  const openOpportunities = opportunities.filter(isOpenOpportunity);
  const hotMarkets = marketSignals.filter(isHotMarket);
  const preferredFuelStops = fuelStops.filter((stop) => stop.preferred);

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      <header className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="brand-kicker">Roadmaster OS</p>
          <h1 className="mt-2 text-3xl font-bold text-[#0a2342]">Load Acquisition Command Center</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#53657b]">
            Track manual load leads, broker signals, direct shipper prospects, carrier referrals, and fuel-stop planning without
            scraping, paid APIs, or automated logins.
          </p>
        </div>
        <Link href="/load-acquisition/opportunities/new" className="btn-primary">
          Add Opportunity
        </Link>
      </header>

      <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <DashboardCard label="Open opportunities" value={String(summary.openOpportunities)} detail="New through negotiating" />
        <DashboardCard label="Hot markets" value={String(summary.hotMarkets)} detail="High or hot demand signals" />
        <DashboardCard label="Active brokers" value={String(summary.activeBrokers)} detail="Active and preferred contacts" />
        <DashboardCard label="Direct shipper leads" value={String(summary.directShipperLeads)} detail="Not lost or closed out" />
        <DashboardCard label="Preferred fuel stops" value={String(summary.preferredFuelStops)} detail="Marked for route planning" />
      </section>

      <section className="panel mb-6 p-5">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="brand-kicker">Manual sourcing only</p>
            <h2 className="mt-1 text-lg font-bold text-[#0a2342]">Every path to the next load</h2>
          </div>
          <span className="text-sm text-[#6b7c93]">No load-board scraping, broker outreach automation, or paid APIs.</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {commandLinks.map((link) => (
            <Link key={link.href} href={link.href} className="surface-row block min-h-28">
              <p className="font-bold text-[#0a2342]">{link.label}</p>
              <p className="mt-2 text-sm leading-5 text-[#6b7c93]">{link.detail}</p>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <section className="panel p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Open Load Opportunities</h2>
            <Link href="/load-acquisition/opportunities" className="text-sm font-semibold text-[#145ea0]">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {openOpportunities.length === 0 ? (
              <p className="text-sm text-[#6b7c93]">No open opportunities yet. Add load-board, broker, shipper, referral, or backhaul leads as they come in.</p>
            ) : (
              openOpportunities.slice(0, 5).map((opportunity) => (
                <div key={opportunity.id} className="surface-row">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-medium text-[#0a2342]">
                        {opportunity.origin} to {opportunity.destination}
                      </p>
                      <p className="mt-1 text-xs text-[#6b7c93]">
                        {formatStatus(opportunity.sourceType)} - {opportunity.brokerName ?? opportunity.shipperName ?? opportunity.sourceName ?? "Manual lead"}
                      </p>
                    </div>
                    <span className={badgeClass(opportunity.priority)}>{formatStatus(opportunity.priority)}</span>
                  </div>
                  <div className="mt-3 grid gap-2 text-xs text-[#6b7c93] sm:grid-cols-3">
                    <span>Rate: {opportunity.rate === null ? "Missing" : formatCurrency(opportunity.rate)}</span>
                    <span>Miles: {opportunity.miles?.toLocaleString() ?? "Missing"}</span>
                    <span>RPM: {formatOpportunityRatePerMile(opportunity.ratePerMile)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="panel p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Hot Market Signals</h2>
            <Link href="/load-acquisition/markets" className="text-sm font-semibold text-[#145ea0]">
              Manage
            </Link>
          </div>
          <div className="space-y-3">
            {hotMarkets.length === 0 ? (
              <p className="text-sm text-[#6b7c93]">No hot markets logged yet. Capture broker, carrier, shipper, or personal observations manually.</p>
            ) : (
              hotMarkets.slice(0, 5).map((market) => (
                <div key={market.id} className="surface-row">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-[#0a2342]">{market.marketName}</p>
                      <p className="mt-1 text-xs text-[#6b7c93]">
                        {market.originRegion ?? "Any origin"} to {market.destinationRegion ?? "Any destination"} - {market.equipmentType ?? "Any equipment"}
                      </p>
                    </div>
                    <span className={badgeClass(market.demandLevel)}>{formatStatus(market.demandLevel)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="panel p-5 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Smart Fuel Stop Planning</h2>
            <Link href="/load-acquisition/fuel-stops" className="text-sm font-semibold text-[#145ea0]">
              Plan fuel
            </Link>
          </div>
          <p className="mb-4 rounded-lg border border-[#f3d69b] bg-[#fff7e8] p-3 text-sm text-[#8a5a00]">
            Fuel and IFTA numbers are planning estimates only. Do not use this module as final tax liability.
          </p>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {preferredFuelStops.length === 0 ? (
              <p className="text-sm text-[#6b7c93]">No preferred fuel stops yet. Mark good planned stops as preferred on the fuel-stops page.</p>
            ) : (
              preferredFuelStops.slice(0, 3).map((stop) => (
                <div key={stop.id} className="surface-row">
                  <p className="font-medium text-[#0a2342]">{stop.truckStopName}</p>
                  <p className="mt-1 text-xs text-[#6b7c93]">
                    {stop.location}
                    {stop.state ? `, ${stop.state}` : ""}
                  </p>
                  <div className="mt-3 grid gap-1 text-xs text-[#6b7c93]">
                    <span>Fuel price: {stop.fuelPrice === null ? "Missing" : formatCurrency(stop.fuelPrice, true)}</span>
                    <span>Gallons: {stop.gallonsPlanned?.toLocaleString() ?? "Missing"}</span>
                    <span>Estimated cost: {formatFuelEstimatedCost(stop.estimatedCost)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
