import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { updateMarketSignal } from "@/app/actions";
import { formatStatus } from "@/lib/formatters";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const demandLevels = ["LOW", "MEDIUM", "HIGH", "HOT"] as const;
const marketSources = ["BROKER", "LOAD_BOARD", "CARRIER", "SHIPPER", "PERSONAL_OBSERVATION", "OTHER"] as const;

export default async function EditMarketSignalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const signal = await prisma.marketSignal.findUnique({ where: { id, deletedAt: null } });

  if (!signal) {
    notFound();
  }

  async function saveMarketSignal(formData: FormData) {
    "use server";
    await updateMarketSignal(id, formData);
    redirect("/load-acquisition/markets");
  }

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
      <header className="mb-8">
        <p className="brand-kicker">Edit market signal</p>
        <h1 className="mt-2 text-2xl font-bold text-[#0a2342]">Edit Hot Market</h1>
        <p className="mt-1 max-w-3xl text-sm text-[#6b7c93]">
          Update the region, equipment, demand level, source, and notes for this manual market signal.
        </p>
      </header>

      <section className="panel p-5">
        <form action={saveMarketSignal} className="grid gap-3">
          <input name="marketName" required className="input" placeholder="Market or lane name" defaultValue={signal.marketName} />
          <input name="originRegion" className="input" placeholder="Origin region" defaultValue={signal.originRegion ?? ""} />
          <input name="destinationRegion" className="input" placeholder="Destination region" defaultValue={signal.destinationRegion ?? ""} />
          <input name="equipmentType" className="input" placeholder="Equipment type" defaultValue={signal.equipmentType ?? ""} />
          <select name="demandLevel" required className="input" defaultValue={signal.demandLevel}>
            {demandLevels.map((level) => (
              <option key={level} value={level}>
                {formatStatus(level)}
              </option>
            ))}
          </select>
          <select name="sourceType" required className="input" defaultValue={signal.sourceType}>
            {marketSources.map((source) => (
              <option key={source} value={source}>
                {formatStatus(source)}
              </option>
            ))}
          </select>
          <input name="sourceName" className="input" placeholder="Source name" defaultValue={signal.sourceName ?? ""} />
          <textarea name="notes" rows={4} className="input" placeholder="Notes" defaultValue={signal.notes ?? ""} />
          <div className="flex flex-wrap gap-3">
            <button type="submit" className="btn-primary">
              Save Changes
            </button>
            <Link href="/load-acquisition/markets" className="btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </section>
    </div>
  );
}
