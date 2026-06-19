import { createDocumentAlertAction } from "@/app/actions";
import { prisma } from "@/lib/prisma";

const statusColors: Record<string, string> = { CURRENT: "badge-green", EXPIRING_SOON: "badge-yellow", EXPIRED: "badge-red", MISSING: "badge-red" };

export default async function DocumentsPage() {
  const alerts = await prisma.documentAlert.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="mx-auto max-w-4xl p-8">
      <header className="mb-8"><h1 className="text-2xl font-bold">Document Alerts</h1><p className="mt-1 text-sm text-slate-400">Track CDL, medical card, registration, insurance, and other required documents.</p></header>

      <div className="panel mb-8 p-6">
        <h2 className="mb-4 font-semibold">Add Document</h2>
        <form action={createDocumentAlertAction} className="grid gap-4 md:grid-cols-3">
          <label className="flex flex-col gap-1 text-sm md:col-span-2">Document Name<input name="title" required className="input" placeholder="Ex: Commercial Driver License" /></label>
          <label className="flex flex-col gap-1 text-sm">Expiration Date<input name="expiresDate" type="date" className="input" /></label>
          <label className="flex flex-col gap-1 text-sm md:col-span-3">Notes<input name="notes" className="input" placeholder="Optional notes" /></label>
          <div><button type="submit" className="btn-primary">Add Document</button></div>
        </form>
      </div>

      <div className="space-y-3">
        {alerts.length === 0 ? <div className="panel p-5 text-sm text-slate-400">No documents tracked yet.</div> : alerts.map((alert) => (
          <div key={alert.id} className="panel flex items-center justify-between p-4">
            <div>
              <p className="font-medium">{alert.title}</p>
              <p className="text-sm text-slate-400">{alert.expiresDate ? `Expires: ${new Date(alert.expiresDate).toLocaleDateString()}` : "No expiration date"}</p>
              {alert.notes && <p className="text-xs text-slate-500">{alert.notes}</p>}
            </div>
            <span className={statusColors[alert.status] ?? "badge"}>{alert.status.replace("_", " ")}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
