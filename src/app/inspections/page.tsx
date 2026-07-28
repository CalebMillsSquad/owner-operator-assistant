import Link from "next/link";

import { createInspectionAction, deleteInspectionAction } from "@/app/actions";
import { ConfirmDeleteButton } from "@/components/ConfirmDeleteButton";
import { inspectionAttentionItems } from "@/lib/alerts";
import { DOT_INSPECTION_ITEMS } from "@/lib/inspections";
import { badgeClass, formatDate, formatStatus } from "@/lib/formatters";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function InspectionsPage() {
  const inspections = await prisma.inspectionChecklist.findMany({
    where: { deletedAt: null },
    include: { items: true },
    orderBy: { inspectionDate: "desc" },
  });
  const attentionItems = inspectionAttentionItems(inspections);

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Inspection Checklist</h1>
        <p className="mt-1 text-sm text-slate-400">Run DOT-style pre-trip and post-trip checks and save the result.</p>
      </header>

      <section className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="panel p-5">
          <p className="text-sm text-slate-400">Inspections Logged</p>
          <p className="mt-2 text-3xl font-semibold">{inspections.length}</p>
        </div>
        <div className="panel p-5">
          <p className="text-sm text-slate-400">Attention Items</p>
          <p className="mt-2 text-3xl font-semibold">{attentionItems.length}</p>
        </div>
        <div className="panel p-5">
          <p className="text-sm text-slate-400">Latest Result</p>
          <p className="mt-2 text-3xl font-semibold">{inspections[0] ? (inspections[0].overallPassed ? "Pass" : "Fail") : "None"}</p>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <section className="panel p-5">
          <h2 className="mb-4 font-semibold">New Inspection</h2>
          <form action={createInspectionAction} className="grid gap-3">
            <select name="type" required className="input">
              <option value="PRE_TRIP">Pre-trip</option>
              <option value="POST_TRIP">Post-trip</option>
            </select>
            <input name="odometer" type="number" step="1" className="input" placeholder="Odometer" />
            <div className="surface-row">
              <p className="mb-3 text-sm font-medium">Mark any failed items</p>
              <div className="space-y-2">
                {DOT_INSPECTION_ITEMS.map((item) => {
                  const value = `${item.category}:${item.item}`;
                  return (
                    <label key={value} className="flex items-center gap-2 text-sm text-[#324761]">
                      <input type="checkbox" name="failedItem" value={value} />
                      <span>
                        {item.category} - {item.item}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
            <textarea name="notes" rows={3} className="input" placeholder="Inspection notes" />
            <button type="submit" className="btn-primary">
              Save Inspection
            </button>
          </form>
        </section>

        <section className="space-y-4">
          {inspections.length === 0 ? (
            <div className="panel p-5 text-sm text-slate-500">
              No inspections on file yet. Complete today&apos;s pre-trip or post-trip checklist so defects do not disappear from view.
            </div>
          ) : (
            inspections.map((inspection) => {
              const failedItems = inspection.items.filter((item) => !item.passed);
              return (
                <div key={inspection.id} className="panel p-5">
                  <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h2 className="font-semibold">{formatStatus(inspection.type).replace(" ", "-")}</h2>
                      <p className="mt-1 text-sm text-slate-400">
                        {formatDate(inspection.inspectionDate)} - Odometer {inspection.odometer ?? "n/a"}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap justify-end gap-2">
                      <span className={badgeClass(inspection.overallPassed ? "PASS" : "FAIL")}>
                        {inspection.overallPassed ? "PASS" : "FAIL"}
                      </span>
                      <Link href={`/inspections/${inspection.id}/edit`} className="btn-secondary">
                        Edit
                      </Link>
                      <form
                        action={async () => {
                          "use server";
                          await deleteInspectionAction(inspection.id);
                        }}
                      >
                        <ConfirmDeleteButton itemName={`${formatStatus(inspection.type).toLowerCase()} inspection from ${formatDate(inspection.inspectionDate)}`} />
                      </form>
                    </div>
                  </div>

                  {failedItems.length === 0 ? (
                    <p className="text-sm text-slate-400">All checklist items passed.</p>
                  ) : (
                    <div className="space-y-2">
                      {failedItems.map((item) => (
                        <div key={item.id} className="rounded-lg border border-red-900 bg-red-950/50 p-3 text-sm text-red-100">
                          {item.category} - {item.item}
                        </div>
                      ))}
                    </div>
                  )}

                  {inspection.notes ? <p className="mt-3 text-sm text-[#324761]">{inspection.notes}</p> : null}
                </div>
              );
            })
          )}
        </section>
      </div>
    </div>
  );
}
