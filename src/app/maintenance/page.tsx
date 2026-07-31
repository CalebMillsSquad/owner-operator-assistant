import { completeMaintenanceAction, createMaintenanceItemAction } from "@/app/actions";
import { prisma } from "@/lib/prisma";

function badgeClass(status: string) {
  switch (status) {
    case "COMPLETED":
      return "badge-green";
    case "DUE_SOON":
      return "badge-yellow";
    case "OVERDUE":
      return "badge-red";
    default:
      return "badge-gray";
  }
}

export default async function MaintenancePage() {
  const items = await prisma.maintenanceItem.findMany({
    orderBy: [{ status: "asc" }, { dueDate: "asc" }, { dueMileage: "asc" }],
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Maintenance Reminders</h1>
        <p className="mt-1 text-sm text-slate-400">Track services by date or mileage and close them out when finished.</p>
      </header>

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <section className="panel p-5">
          <h2 className="mb-4 font-semibold">Add Maintenance Item</h2>
          <form action={createMaintenanceItemAction} className="grid gap-3">
            <input name="title" required className="input" placeholder="Service title" />
            <input name="dueDate" type="date" className="input" />
            <input name="dueMileage" type="number" step="1" className="input" placeholder="Due mileage" />
            <input name="currentMileage" type="number" step="1" className="input" placeholder="Current mileage" />
            <textarea name="notes" rows={3} className="input" placeholder="Notes" />
            <button type="submit" className="btn-primary">
              Save Reminder
            </button>
          </form>
        </section>

        <section className="space-y-4">
          {items.length === 0 ? (
            <div className="panel p-5 text-sm text-slate-500">No maintenance reminders yet.</div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="panel p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="font-semibold">{item.title}</h2>
                      <span className={badgeClass(item.status)}>{item.status.replaceAll("_", " ")}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-400">
                      <span>{item.dueDate ? `Due ${new Date(item.dueDate).toLocaleDateString()}` : "No due date"}</span>
                      <span>{item.dueMileage ? `Due at ${item.dueMileage.toLocaleString()} miles` : "No mileage target"}</span>
                      <span>{item.currentMileage ? `Current ${item.currentMileage.toLocaleString()} miles` : "Current mileage not set"}</span>
                    </div>
                    {item.notes ? <p className="mt-3 text-sm text-slate-300">{item.notes}</p> : null}
                  </div>

                  {item.status !== "COMPLETED" ? (
                    <form
                      action={async () => {
                        "use server";
                        await completeMaintenanceAction(item.id);
                      }}
                    >
                      <button type="submit" className="btn-secondary">
                        Mark Complete
                      </button>
                    </form>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  );
}
