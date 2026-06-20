import { createLoadAction, updateLoadStatusAction } from "@/app/actions";
import { prisma } from "@/lib/prisma";

const statusOptions = ["BOOKED", "IN_TRANSIT", "DELIVERED", "CANCELLED"] as const;

export default async function LoadsPage() {
  const loads = await prisma.load.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="mx-auto max-w-6xl p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Load Tracking</h1>
        <p className="mt-1 text-sm text-slate-400">Capture active loads and keep delivery status current.</p>
      </header>

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <section className="panel p-5">
          <h2 className="mb-4 font-semibold">Add Load</h2>
          <form action={createLoadAction} className="grid gap-3">
            <input name="origin" required className="input" placeholder="Origin" />
            <input name="destination" required className="input" placeholder="Destination" />
            <input name="broker" className="input" placeholder="Broker or customer" />
            <input name="commodity" className="input" placeholder="Commodity" />
            <input name="rate" type="number" step="0.01" className="input" placeholder="Rate" />
            <input name="miles" type="number" step="0.1" className="input" placeholder="Miles" />
            <button type="submit" className="btn-primary">
              Save Load
            </button>
          </form>
        </section>

        <section className="space-y-4">
          {loads.length === 0 ? (
            <div className="panel p-5 text-sm text-slate-500">No loads yet.</div>
          ) : (
            loads.map((load) => (
              <div key={load.id} className="panel p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h2 className="font-semibold">
                      {load.origin} to {load.destination}
                    </h2>
                    <p className="mt-1 text-sm text-slate-400">
                      {load.broker ?? "Direct"} • {load.commodity ?? "General freight"}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-400">
                      <span>Rate: {load.rate ?? 0}</span>
                      <span>Miles: {load.miles ?? 0}</span>
                      <span>Rate/mile: {load.ratePerMile ? load.ratePerMile.toFixed(2) : "n/a"}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {statusOptions.map((status) => (
                      <form
                        key={status}
                        action={async () => {
                          "use server";
                          await updateLoadStatusAction(load.id, status);
                        }}
                      >
                        <button
                          type="submit"
                          className={status === load.status ? "btn-primary" : "btn-secondary"}
                        >
                          {status.replaceAll("_", " ")}
                        </button>
                      </form>
                    ))}
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
