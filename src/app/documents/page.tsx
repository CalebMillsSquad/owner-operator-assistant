import { createDocumentAlertAction } from "@/app/actions";
import { prisma } from "@/lib/prisma";

function badgeClass(status: string) {
  switch (status) {
    case "CURRENT":
      return "badge-green";
    case "EXPIRING_SOON":
      return "badge-yellow";
    case "EXPIRED":
    case "MISSING":
      return "badge-red";
    default:
      return "badge-gray";
  }
}

export default async function DocumentsPage() {
  const alerts = await prisma.documentAlert.findMany({ orderBy: { updatedAt: "desc" } });

  return (
    <div className="mx-auto max-w-6xl p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Missing Document Alerts</h1>
        <p className="mt-1 text-sm text-slate-400">Track registrations, permits, insurance, and renewals.</p>
      </header>

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <section className="panel p-5">
          <h2 className="mb-4 font-semibold">Add Document</h2>
          <form action={createDocumentAlertAction} className="grid gap-3">
            <input name="title" required className="input" placeholder="Document title" />
            <input name="expiresDate" type="date" className="input" />
            <textarea name="notes" rows={3} className="input" placeholder="Notes" />
            <button type="submit" className="btn-primary">
              Save Alert
            </button>
          </form>
        </section>

        <section className="space-y-4">
          {alerts.length === 0 ? (
            <div className="panel p-5 text-sm text-slate-500">No document alerts yet.</div>
          ) : (
            alerts.map((alert) => (
              <div key={alert.id} className="panel p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold">{alert.title}</h2>
                    <p className="mt-1 text-sm text-slate-400">
                      {alert.expiresDate ? new Date(alert.expiresDate).toLocaleDateString() : "No expiration date on file"}
                    </p>
                    {alert.notes ? <p className="mt-2 text-sm text-slate-300">{alert.notes}</p> : null}
                  </div>
                  <span className={badgeClass(alert.status)}>{alert.status.replaceAll("_", " ")}</span>
                </div>
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  );
}
