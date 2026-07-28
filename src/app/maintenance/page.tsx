import Link from "next/link";

import { completeMaintenanceAction, createMaintenanceItemAction, deleteMaintenanceItemAction } from "@/app/actions";
import { ConfirmDeleteButton } from "@/components/ConfirmDeleteButton";
import { maintenanceAttentionItems } from "@/lib/alerts";
import { badgeClass, formatDate, formatStatus } from "@/lib/formatters";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function MaintenancePage() {
  const items = await prisma.maintenanceItem.findMany({
    where: { deletedAt: null },
    orderBy: [{ status: "asc" }, { dueDate: "asc" }, { dueMileage: "asc" }],
  });
  const dueItems = maintenanceAttentionItems(items);

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Maintenance Reminders</h1>
        <p className="mt-1 text-sm text-slate-400">Track services by date or mileage and close them out when finished.</p>
      </header>

      <section className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="panel p-5">
          <p className="text-sm text-slate-400">Open Reminders</p>
          <p className="mt-2 text-3xl font-semibold">{items.filter((item) => item.status !== "COMPLETED").length}</p>
        </div>
        <div className="panel p-5">
          <p className="text-sm text-slate-400">Due or Overdue</p>
          <p className="mt-2 text-3xl font-semibold">{dueItems.length}</p>
        </div>
        <div className="panel p-5">
          <p className="text-sm text-slate-400">Completed</p>
          <p className="mt-2 text-3xl font-semibold">{items.filter((item) => item.status === "COMPLETED").length}</p>
        </div>
      </section>

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
            <div className="panel p-5 text-sm text-slate-500">
              No maintenance reminders yet. Add oil changes, tire work, annual inspections, and repairs before they become downtime.
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="panel p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="font-semibold">{item.title}</h2>
                      <span className={badgeClass(item.status)}>{formatStatus(item.status)}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-400">
                      <span>{item.dueDate ? `Due ${formatDate(item.dueDate)}` : "No due date"}</span>
                      <span>{item.dueMileage ? `Due at ${item.dueMileage.toLocaleString()} miles` : "No mileage target"}</span>
                      <span>{item.currentMileage ? `Current ${item.currentMileage.toLocaleString()} miles` : "Current mileage not set"}</span>
                    </div>
                    {item.notes ? <p className="mt-3 text-sm text-[#324761]">{item.notes}</p> : null}
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Link href={`/maintenance/${item.id}/edit`} className="btn-secondary">
                      Edit
                    </Link>
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
                    <form
                      action={async () => {
                        "use server";
                        await deleteMaintenanceItemAction(item.id);
                      }}
                    >
                      <ConfirmDeleteButton itemName={`maintenance item ${item.title}`} />
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
