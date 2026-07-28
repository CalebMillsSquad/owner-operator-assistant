import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { updateInspectionAction } from "@/app/actions";
import { DOT_INSPECTION_ITEMS } from "@/lib/inspections";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function dateInputValue(date: Date | null) {
  return date ? date.toISOString().slice(0, 10) : "";
}

export default async function EditInspectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const inspection = await prisma.inspectionChecklist.findUnique({ where: { id, deletedAt: null }, include: { items: true } });

  if (!inspection) {
    notFound();
  }

  const failedItems = new Set(inspection.items.filter((item) => !item.passed).map((item) => `${item.category}:${item.item}`));

  async function saveInspection(formData: FormData) {
    "use server";
    await updateInspectionAction(id, formData);
    redirect("/inspections");
  }

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
      <header className="mb-8">
        <p className="brand-kicker">Edit DOT checklist</p>
        <h1 className="mt-2 text-2xl font-bold text-white">Edit Inspection</h1>
        <p className="mt-1 max-w-3xl text-sm text-[#9badc3]">
          Update inspection date, type, odometer, failed checklist items, and notes. Pass/fail recalculates from failed items.
        </p>
      </header>

      <section className="panel p-5">
        <form action={saveInspection} className="grid gap-4">
          <div className="grid gap-3 md:grid-cols-3">
            <select name="type" required className="input" defaultValue={inspection.type}>
              <option value="PRE_TRIP">Pre-trip</option>
              <option value="POST_TRIP">Post-trip</option>
            </select>
            <input name="inspectionDate" type="date" required className="input" defaultValue={dateInputValue(inspection.inspectionDate)} />
            <input name="odometer" type="number" step="1" className="input" placeholder="Odometer" defaultValue={inspection.odometer ?? ""} />
          </div>

          <div className="surface-row">
            <p className="mb-3 text-sm font-medium text-white">Failed items</p>
            <div className="grid gap-2 md:grid-cols-2">
              {DOT_INSPECTION_ITEMS.map((item) => {
                const value = `${item.category}:${item.item}`;
                return (
                  <label key={value} className="flex items-center gap-2 text-sm text-[#d7e3f2]">
                    <input type="checkbox" name="failedItem" value={value} defaultChecked={failedItems.has(value)} />
                    <span>
                      {item.category} - {item.item}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <textarea name="notes" rows={4} className="input" placeholder="Inspection notes" defaultValue={inspection.notes ?? ""} />

          <div className="flex flex-wrap gap-3">
            <button type="submit" className="btn-primary">
              Save Changes
            </button>
            <Link href="/inspections" className="btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </section>
    </div>
  );
}
