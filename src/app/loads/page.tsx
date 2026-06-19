import { createLoadAction } from "@/app/actions";
import { prisma } from "@/lib/prisma";

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

const statusColors: Record<string, string> = { BOOKED: "badge", IN_TRANSIT: "badge-yellow", DELIVERED: "badge-green", CANCELLED: "badge-gray" };

export default async function LoadsPage() {
  const loads = await prisma.load.findMany({ orderBy: { createdAt: "desc" }, include: { expenses: true } });

  return (
    <div className="mx-auto max-w-5xl p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Load Tracking</h1>
        <p className="mt-1 text-sm text-slate-400">Track all loads — booked, in transit, and delivered.</p>
      </header>

      <div className="panel mb-8 p-6">
        <h2 className="mb-4 font-semibold">Add Load</h2>
        <form action={createLoadAction} className="grid gap-4 md:grid-cols-3">
          <label className="flex flex-col gap-1 text-sm">Origin<input name="origin" required className="input" placeholder="City, ST" /></label>
          <label className="flex flex-col gap-1 text-sm">Destination<input name="destination" required className="input" placeholder="City, ST" /></label>
          <label className="flex flex-col gap-1 text-sm">Broker<input name="broker" className="input" placeholder="Broker name" /></label>
          <label className="flex flex-col gap-1 text-sm">Rate ($)<input name="rate" type="number" step="0.01" className="input" placeholder="0.00" /></label>
          <label className="flex flex-col gap-1 text-sm">Miles<input name="miles" type="number" step="0.1" className="input" placeholder="0" /></label>
          <label className="flex flex-col gap-1 text-sm">Commodity<input name="commodity" className="input" placeholder="What are you hauling?" /></label>
          <div className="md:col-span-3"><button type="submit" className="btn-primary">Add Load</button></div>
        </form>
      </div>

      <div className="space-y-3">
        {loads.length === 0 ? <div className="panel p-5 text-sm text-slate-400">No loads yet.</div> : loads.map((load) => (
          <div key={load.id} className="panel flex items-center justify-between p-4">
            <div>
              <p className="font-medium">{load.origin} → {load.destination}</p>
              <p className="text-sm text-slate-400">{load.broker ?? "No broker"} {load.rate ? `· ${formatCurrency(load.rate)}` : ""} {load.ratePerMile ? `· ${formatCurrency(load.ratePerMile)}/mi` : ""}</p>
              {load.commodity && <p className="text-xs text-slate-500">{load.commodity}</p>}
            </div>
            <span className={statusColors[load.status] ?? "badge"}>{load.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
