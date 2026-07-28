import Link from "next/link";
import type { Prisma } from "@prisma/client";

import { createMarketSignal, deleteMarketSignal } from "@/app/actions";
import { ConfirmDeleteButton } from "@/components/ConfirmDeleteButton";
import { badgeClass, formatStatus } from "@/lib/formatters";
import { isHotMarket } from "@/lib/load-acquisition";
import { prisma } from "@/lib/prisma";
import { getEnumSearchParam, type PageSearchParams } from "@/lib/search-params";

export const dynamic = "force-dynamic";

const demandLevels = ["LOW", "MEDIUM", "HIGH", "HOT"] as const;
const marketSources = ["BROKER", "LOAD_BOARD", "CARRIER", "SHIPPER", "PERSONAL_OBSERVATION", "OTHER"] as const;

export default async function MarketsPage({ searchParams }: { searchParams: PageSearchParams }) {
  const params = await searchParams;
  const demandFilter = getEnumSearchParam(demandLevels, params.demand);
  const where: Prisma.MarketSignalWhereInput = {
    deletedAt: null,
    ...(demandFilter ? { demandLevel: demandFilter } : {}),
  };
  const signals = await prisma.marketSignal.findMany({ where, orderBy: [{ demandLevel: "desc" }, { updatedAt: "desc" }] });
  const hotSignals = signals.filter(isHotMarket);
  const hasFilters = Boolean(demandFilter);

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      <header className="mb-8">
        <p className="brand-kicker">Load Acquisition</p>
        <h1 className="mt-2 text-2xl font-bold text-[#0a2342]">Broker Hot Markets</h1>
        <p className="mt-1 text-sm text-[#6b7c93]">
          Capture manual market signals from broker conversations, boards you review yourself, carriers, shippers, and personal observations.
        </p>
      </header>

      <section className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="panel p-5">
          <p className="text-sm text-[#6b7c93]">Market Signals</p>
          <p className="mt-2 text-3xl font-semibold">{signals.length}</p>
        </div>
        <div className="panel p-5">
          <p className="text-sm text-[#6b7c93]">High or Hot</p>
          <p className="mt-2 text-3xl font-semibold">{hotSignals.length}</p>
        </div>
        <div className="panel p-5">
          <p className="text-sm text-[#6b7c93]">Manual Sources</p>
          <p className="mt-2 text-3xl font-semibold">{new Set(signals.map((signal) => signal.sourceType)).size}</p>
        </div>
      </section>

      <section className="panel mb-6 p-4">
        <form action="/load-acquisition/markets" className="grid gap-3 md:grid-cols-[1fr_auto_auto] md:items-center">
          <select name="demand" className="input" aria-label="Market demand" defaultValue={demandFilter ?? ""}>
            <option value="">All demand levels</option>
            {demandLevels.map((level) => (
              <option key={level} value={level}>
                {formatStatus(level)}
              </option>
            ))}
          </select>
          <button type="submit" className="btn-primary">
            Apply Filters
          </button>
          {hasFilters ? (
            <Link href="/load-acquisition/markets" className="btn-secondary">
              Clear
            </Link>
          ) : null}
        </form>
      </section>

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <section className="panel p-5">
          <h2 className="mb-4 font-semibold">Add Market Signal</h2>
          <form action={createMarketSignal} className="grid gap-3">
            <input name="marketName" required className="input" placeholder="Market or lane name" />
            <input name="originRegion" className="input" placeholder="Origin region" />
            <input name="destinationRegion" className="input" placeholder="Destination region" />
            <input name="equipmentType" className="input" placeholder="Equipment type" />
            <select name="demandLevel" required className="input" defaultValue="MEDIUM">
              {demandLevels.map((level) => (
                <option key={level} value={level}>
                  {formatStatus(level)}
                </option>
              ))}
            </select>
            <select name="sourceType" required className="input" defaultValue="BROKER">
              {marketSources.map((source) => (
                <option key={source} value={source}>
                  {formatStatus(source)}
                </option>
              ))}
            </select>
            <input name="sourceName" className="input" placeholder="Source name" />
            <textarea name="notes" rows={3} className="input" placeholder="Notes" />
            <button type="submit" className="btn-primary">
              Save Signal
            </button>
          </form>
        </section>

        <section className="space-y-4">
          {signals.length === 0 ? (
            <div className="panel p-5 text-sm text-[#6b7c93]">No market signals yet. Add lanes or regions you are seeing heat up.</div>
          ) : (
            signals.map((signal) => (
              <div key={signal.id} className="panel p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold text-[#0a2342]">{signal.marketName}</h2>
                      <span className={badgeClass(signal.demandLevel)}>{formatStatus(signal.demandLevel)}</span>
                    </div>
                    <p className="mt-1 text-sm text-[#6b7c93]">
                      {signal.originRegion ?? "Any origin"} to {signal.destinationRegion ?? "Any destination"}
                    </p>
                    <div className="mt-3 grid gap-2 text-xs text-[#6b7c93] sm:grid-cols-3">
                      <span>Equipment: {signal.equipmentType ?? "Any"}</span>
                      <span>Source: {formatStatus(signal.sourceType)}</span>
                      <span>Name: {signal.sourceName ?? "Not set"}</span>
                    </div>
                    {signal.notes ? <p className="mt-3 text-sm text-[#324761]">{signal.notes}</p> : null}
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Link href={`/load-acquisition/markets/${signal.id}/edit`} className="btn-secondary">
                      Edit
                    </Link>
                    <form
                      action={async () => {
                        "use server";
                        await deleteMarketSignal(signal.id);
                      }}
                    >
                      <ConfirmDeleteButton itemName={`market signal ${signal.marketName}`} />
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
