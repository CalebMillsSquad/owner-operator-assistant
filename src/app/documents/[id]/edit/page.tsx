import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { updateDocumentAlertAction } from "@/app/actions";
import { effectiveDocumentStatus } from "@/lib/alerts";
import { badgeClass, formatStatus } from "@/lib/formatters";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function dateInputValue(date: Date | null) {
  return date ? date.toISOString().slice(0, 10) : "";
}

export default async function EditDocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const alert = await prisma.documentAlert.findUnique({ where: { id, deletedAt: null } });

  if (!alert) {
    notFound();
  }

  const status = effectiveDocumentStatus(alert);

  async function saveDocument(formData: FormData) {
    "use server";
    await updateDocumentAlertAction(id, formData);
    redirect("/documents");
  }

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
      <header className="mb-8">
        <p className="brand-kicker">Edit paperwork reminder</p>
        <h1 className="mt-2 text-2xl font-bold text-white">Edit Document Reference</h1>
        <p className="mt-1 max-w-3xl text-sm text-[#9badc3]">
          Update reference title, expiration date, and notes. This route is for organizing document references before a future upload workflow is approved.
        </p>
      </header>

      <section className="panel p-5">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-sm text-[#9badc3]">Current status</span>
          <span className={badgeClass(status)}>{formatStatus(status)}</span>
        </div>

        <form action={saveDocument} className="grid gap-4">
          <input name="title" required className="input" placeholder="Document title" defaultValue={alert.title} />
          <input name="expiresDate" type="date" className="input" defaultValue={dateInputValue(alert.expiresDate)} />
          <textarea name="notes" rows={4} className="input" placeholder="Notes" defaultValue={alert.notes ?? ""} />

          <div className="flex flex-wrap gap-3">
            <button type="submit" className="btn-primary">
              Save Changes
            </button>
            <Link href="/documents" className="btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </section>
    </div>
  );
}
