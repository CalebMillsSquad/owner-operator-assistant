import Link from "next/link";

import { badgeClass, formatCurrency, formatDate, formatRatePerMile, formatStatus } from "@/lib/formatters";
import { buildLaneIntelligence, getRecentLaneRecords } from "@/lib/lane-intelligence-core";
import { isOpenOpportunity } from "@/lib/load-acquisition";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function StatCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="panel p-5">
      <p className="text-sm text-[#6b7c93]">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-[#0a2342]">{value}</p>
      <p className="mt-2 text-xs text-[#6b7c93]">{detail}</p>
    </div>
  );
}

function EmptyState() {
  return (
    <section className="panel p-6">
      <p className="brand-kicker">Manual lane memory</p>
      <h2 className="mt-2 text-xl font-bold text-[#0a2342]">No lane records yet</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6b7c93]">
        Add loads or open load opportunities with origin and destination details to start building a local lane review board.
        Broker, shipper, market, and fuel-stop context will appear when those existing manual notes mention the same lane.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link href="/loads" className="btn-primary">
          Add Load
        </Link>
        <Link href="/load-acquisition/opportunities/new" className="btn-secondary">
          Add Opportunity
        </Link>
      </div>
    </section>
  );
}

export default async function LaneIntelligencePage() {
  const [loads, opportunities, brokerContacts, shipperLeads, marketSignals, fuelStops] = await Promise.all([
    prisma.load.findMany({ where: { deletedAt: null }, orderBy: { updatedAt: "desc" } }),
    prisma.loadOpportunity.findMany({ where: { deletedAt: null }, orderBy: { updatedAt: "desc" } }),
    prisma.brokerContact.findMany({ where: { deletedAt: null }, orderBy: { updatedAt: "desc" } }),
    prisma.shipperLead.findMany({ where: { deletedAt: null }, orderBy: { updatedAt: "desc" } }),
    prisma.marketSignal.findMany({ where: { deletedAt: null }, orderBy: [{ demandLevel: "desc" }, { updatedAt: "desc" }] }),
    prisma.smartFuelStop.findMany({ where: { deletedAt: null }, orderBy: [{ preferred: "desc" }, { updatedAt: "desc" }] }),
  ]);

  const openOpportunities = opportunities.filter(isOpenOpportunity);
  const lanes = buildLaneIntelligence({
    loads,
    opportunities: openOpportunities,
    brokerContacts,
    shipperLeads,
    marketSignals,
    fuelStops,
  });

  const lanesWithRelationshipNotes = lanes.filter(
    (lane) => lane.brokers.length + lane.shippers.length + lane.marketSignals.length + lane.fuelStops.length > 0,
  ).length;

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      <header className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="brand-kicker">Load Acquisition</p>
          <h1 className="mt-2 text-3xl font-bold text-[#0a2342]">Manual Lane Intelligence</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#53657b]">
            Review recurring lanes from existing local loads and open opportunities, then compare any manual broker,
            shipper, market, and fuel-stop notes already recorded for those lanes.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/load-acquisition/opportunities/new" className="btn-primary">
            Add Opportunity
          </Link>
          <Link href="/load-acquisition" className="btn-secondary">
            Load Board
          </Link>
        </div>
      </header>

      <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Tracked lanes" value={String(lanes.length)} detail="From local loads and open opportunities" />
        <StatCard label="Active loads" value={String(loads.filter((load) => load.status !== "DELIVERED").length)} detail="Booked or in transit records" />
        <StatCard label="Open opportunities" value={String(openOpportunities.length)} detail="New through negotiating leads" />
        <StatCard label="Lanes with notes" value={String(lanesWithRelationshipNotes)} detail="Broker, shipper, market, or fuel-stop context" />
      </section>

      <section className="panel mb-6 p-4">
        <p className="text-sm leading-6 text-[#6b7c93]">
          This is a read-only lane review surface built from local manual records. It does not use live load-board data,
          market feeds, route optimization, automated outreach, or contract guarantees.
        </p>
      </section>

      {lanes.length === 0 ? (
        <EmptyState />
      ) : (
        <section className="space-y-5">
          {lanes.map((lane) => {
            const relatedNoteCount = lane.brokers.length + lane.shippers.length + lane.marketSignals.length + lane.fuelStops.length;
            const recentRecords = getRecentLaneRecords(lane.records);

            return (
              <article key={lane.key} className="panel p-5">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0">
                    <p className="brand-kicker">Lane review</p>
                    <h2 className="mt-1 text-xl font-bold text-[#0a2342]">
                      {lane.origin} to {lane.destination}
                    </h2>
                    <p className="mt-2 text-sm text-[#6b7c93]">
                      {lane.totalRecords} local record{lane.totalRecords === 1 ? "" : "s"} - {lane.loadCount} load
                      {lane.loadCount === 1 ? "" : "s"} - {lane.opportunityCount} open opportunit
                      {lane.opportunityCount === 1 ? "y" : "ies"}
                    </p>
                  </div>
                  <div className="grid gap-2 text-sm text-[#53657b] sm:grid-cols-3 xl:min-w-[34rem]">
                    <div className="surface-row">
                      <p className="text-xs uppercase text-[#6b7c93]">Avg RPM</p>
                      <p className="mt-1 font-semibold text-[#0a2342]">{formatRatePerMile(lane.averageRatePerMile)}</p>
                    </div>
                    <div className="surface-row">
                      <p className="text-xs uppercase text-[#6b7c93]">Manual notes</p>
                      <p className="mt-1 font-semibold text-[#0a2342]">{relatedNoteCount}</p>
                    </div>
                    <div className="surface-row">
                      <p className="text-xs uppercase text-[#6b7c93]">Latest activity</p>
                      <p className="mt-1 font-semibold text-[#0a2342]">{formatDate(lane.latestActivity)}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 xl:grid-cols-[1fr_0.85fr]">
                  <div className="surface-row">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="font-semibold text-[#0a2342]">Recent lane records</h3>
                      <span className="text-xs text-[#6b7c93]">Read-only</span>
                    </div>
                    <div className="space-y-3">
                      {recentRecords.map((record) => (
                        <div key={`${record.type}-${record.id}`} className="rounded-lg border border-[#dce7f3] bg-white p-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="font-medium text-[#0a2342]">
                              {record.type === "load" ? "Load record" : "Open opportunity"}
                            </p>
                            <span className={badgeClass(record.status)}>{formatStatus(record.status)}</span>
                          </div>
                          <div className="mt-2 grid gap-2 text-xs text-[#6b7c93] sm:grid-cols-3">
                            <span>Rate: {record.rate === null ? "Missing" : formatCurrency(record.rate)}</span>
                            <span>Miles: {record.miles?.toLocaleString() ?? "Missing"}</span>
                            <span>
                              Contact:{" "}
                              {record.type === "load"
                                ? record.broker ?? "Not set"
                                : record.brokerName ?? record.shipperName ?? "Not set"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-4">
                    <div className="surface-row">
                      <h3 className="font-semibold text-[#0a2342]">Broker and shipper notes</h3>
                      <div className="mt-3 space-y-2 text-sm text-[#53657b]">
                        {lane.brokers.length === 0 && lane.shippers.length === 0 ? (
                          <p>No broker or shipper lane notes matched this lane yet.</p>
                        ) : (
                          <>
                            {lane.brokers.slice(0, 3).map((broker) => (
                              <p key={broker.id}>
                                <span className="font-medium text-[#0a2342]">{broker.companyName}</span> -{" "}
                                {formatStatus(broker.relationshipStatus)}
                              </p>
                            ))}
                            {lane.shippers.slice(0, 3).map((shipper) => (
                              <p key={shipper.id}>
                                <span className="font-medium text-[#0a2342]">{shipper.companyName}</span> -{" "}
                                {formatStatus(shipper.status)}
                              </p>
                            ))}
                          </>
                        )}
                      </div>
                    </div>

                    <div className="surface-row">
                      <h3 className="font-semibold text-[#0a2342]">Market and fuel context</h3>
                      <div className="mt-3 space-y-2 text-sm text-[#53657b]">
                        {lane.marketSignals.length === 0 && lane.fuelStops.length === 0 ? (
                          <p>No local market signals or fuel-stop notes matched this lane yet.</p>
                        ) : (
                          <>
                            {lane.marketSignals.slice(0, 3).map((signal) => (
                              <p key={signal.id}>
                                <span className={badgeClass(signal.demandLevel)}>{formatStatus(signal.demandLevel)}</span>{" "}
                                <span className="font-medium text-[#0a2342]">{signal.marketName}</span>
                              </p>
                            ))}
                            {lane.fuelStops.slice(0, 3).map((stop) => (
                              <p key={stop.id}>
                                <span className="font-medium text-[#0a2342]">{stop.truckStopName}</span> - {stop.location}
                                {stop.state ? `, ${stop.state}` : ""}
                              </p>
                            ))}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}
