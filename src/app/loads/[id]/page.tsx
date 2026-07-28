import Link from "next/link";
import { notFound } from "next/navigation";

import { formatCurrency, formatDate, formatRatePerMile, formatStatus } from "@/lib/formatters";
import { calculateLoadProfit } from "@/lib/profitability";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function LoadProfitabilityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const load = await prisma.load.findUnique({
    where: { id, deletedAt: null },
    include: { expenses: { where: { deletedAt: null }, orderBy: { expenseDate: "desc" } } },
  });
  if (!load) notFound();
  const snapshot = calculateLoadProfit(load);

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
      <Link href="/loads" className="text-sm text-sky-300 hover:text-sky-200">&lt; Back to loads</Link>
      <header className="mb-8 mt-5">
        <p className="brand-kicker">Load profitability</p>
        <h1 className="mt-2 text-2xl font-bold">{load.loadNumber ?? `${load.origin} to ${load.destination}`}</h1>
        <p className="mt-1 text-sm text-slate-400">{load.origin} to {load.destination} · {formatStatus(load.status)}</p>
      </header>

      <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Load profitability metrics">
        {[
          ["Gross rate", formatCurrency(snapshot.revenue)],
          ["Direct expenses", formatCurrency(snapshot.linkedExpenseTotal)],
          ["Net load profit", formatCurrency(snapshot.net)],
          ["Profitability", snapshot.status],
        ].map(([label, value]) => <div className="panel p-5" key={label}><p className="text-sm text-slate-400">{label}</p><p className="mt-2 text-2xl font-semibold">{value}</p></div>)}
      </section>

      <section className="panel mb-6 p-5">
        <h2 className="mb-4 font-semibold">Mileage and return</h2>
        <div className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-5">
          <Metric label="Loaded miles" value={snapshot.loadedMiles?.toLocaleString() ?? "Missing"} />
          <Metric label="Deadhead miles" value={snapshot.deadheadMiles?.toLocaleString() ?? "Missing"} />
          <Metric label="Total miles" value={snapshot.totalMiles?.toLocaleString() ?? "Missing"} />
          <Metric label="Revenue / loaded mile" value={formatRatePerMile(snapshot.revenuePerLoadedMile)} />
          <Metric label="Net / total mile" value={formatRatePerMile(snapshot.netPerTotalMile)} />
        </div>
        {snapshot.missingFields.length > 0 ? <p className="mt-4 text-sm text-amber-700">Missing {snapshot.missingFields.join(" and ")}. Edit this load to complete the profitability view.</p> : null}
      </section>

      <section className="panel p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 className="font-semibold">Linked expenses</h2><Link href={`/expenses?loadId=${load.id}`} className="btn-secondary">Add expense</Link></div>
        {load.expenses.length === 0 ? <p className="text-sm text-slate-500">No direct expenses are linked to this load yet.</p> : <div className="space-y-2">{load.expenses.map((expense) => <div className="surface-row flex items-center justify-between gap-3" key={expense.id}><span>{formatStatus(expense.category)} · {expense.vendor ?? "Unknown vendor"} · {formatDate(expense.expenseDate)}</span><strong>{formatCurrency(expense.amount, true)}</strong></div>)}</div>}
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div><p className="text-slate-500">{label}</p><p className="mt-1 font-semibold text-[#0a2342]">{value}</p></div>;
}
