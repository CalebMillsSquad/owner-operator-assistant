export const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export const preciseCurrencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatCurrency(amount: number | null | undefined, precise = false) {
  return (precise ? preciseCurrencyFormatter : currencyFormatter).format(amount ?? 0);
}

export function formatRatePerMile(amount: number | null | undefined) {
  return amount === null || amount === undefined ? "Not available" : `${preciseCurrencyFormatter.format(amount)}/mi`;
}

export function formatDate(date: Date | string | null | undefined) {
  if (!date) {
    return "No date set";
  }

  return new Date(date).toLocaleDateString();
}

export function formatWeekRange(start: Date, endExclusive: Date) {
  const end = new Date(endExclusive);
  end.setDate(end.getDate() - 1);

  const startLabel = start.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const isSameMonth = start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth();
  const endLabel = isSameMonth
    ? `${end.toLocaleDateString("en-US", { day: "numeric" })}, ${end.getFullYear()}`
    : end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return `${startLabel} - ${endLabel}`;
}

export function formatStatus(status: string) {
  return status.replaceAll("_", " ");
}

export function badgeClass(status: string) {
  switch (status) {
    case "DELIVERED":
    case "CURRENT":
    case "COMPLETED":
    case "PASS":
    case "BOOKED":
    case "ACTIVE":
    case "PREFERRED":
      return "badge-green";
    case "EXPIRING_SOON":
    case "DUE_SOON":
    case "IN_TRANSIT":
    case "MEDIUM":
    case "REVIEWING":
    case "CONTACTED":
    case "NEGOTIATING":
    case "QUALIFIED":
    case "PROPOSAL_SENT":
    case "WATCHLIST":
      return "badge-yellow";
    case "EXPIRED":
    case "MISSING":
    case "OVERDUE":
    case "CANCELLED":
    case "FAIL":
    case "HIGH":
    case "HOT":
    case "URGENT":
    case "REJECTED":
    case "DO_NOT_USE":
      return "badge-red";
    default:
      return "badge-gray";
  }
}
