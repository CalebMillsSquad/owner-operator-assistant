import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { updateMaintenanceItemAction } from "@/app/actions";
import { formatStatus } from "@/lib/formatters";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const statusOptions = ["UPCOMING", "DUE_SOON", "OVERDUE", "COMPLETED"] as const;

function dateInputValue(date: Date | null) {
  return date ? date.toISOString().slice(0, 10) : "";
}

export default async function EditMaintenancePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await prisma.maintenanceItem.findUnique({ where: { id, deletedAt: null } });

  if (!item) {
    notFound();
  }

  async function saveMaintenanceItem(formData: FormData) {
    "use server";
    await updateMaintenanceItemAction(id, formData);
    redirect("/maintenance");
  }

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
      <header className="mb-8">
        <p className="brand-kicker">Edit service reminder</p>
        <h1 className="mt-2 text-2xl font-bold text-white">Edit Maintenance Item</h1>
        <p className="mt-1 max-w-3xl text-sm text-[#9badc3]">
          Update due targets, current mileage, service history, and notes. Open reminder status recalculates from date and mileage.
        </p>
      </header>

      <section className="panel p-5">
        <form action={saveMaintenanceItem} className="grid gap-4">
          <div className="grid gap-3 md:grid-cols-2">
            <input name="title" required className="input" placeholder="Service title" defaultValue={item.title} />
            <select name="status" required className="input" defaultValue={item.status}>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {formatStatus(status)}
                </option>
              ))}
            </select>
            <input name="dueDate" type="date" className="input" defaultValue={dateInputValue(item.dueDate)} />
            <input name="dueMileage" type="number" step="1" className="input" placeholder="Due mileage" defaultValue={item.dueMileage ?? ""} />
            <input name="currentMileage" type="number" step="1" className="input" placeholder="Current mileage" defaultValue={item.currentMileage ?? ""} />
            <input name="lastServiceDate" type="date" className="input" defaultValue={dateInputValue(item.lastServiceDate)} />
            <input
              name="lastServiceMileage"
              type="number"
              step="1"
              className="input"
              placeholder="Last service mileage"
              defaultValue={item.lastServiceMileage ?? ""}
            />
          </div>

          <textarea name="notes" rows={4} className="input" placeholder="Notes" defaultValue={item.notes ?? ""} />

          <div className="flex flex-wrap gap-3">
            <button type="submit" className="btn-primary">
              Save Changes
            </button>
            <Link href="/maintenance" className="btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </section>
    </div>
  );
}
