import { formatCurrency, formatRatePerMile } from "@/lib/formatters";
export {
  buildAcquisitionSummary,
  calculateFuelEstimatedCost,
  calculateOpportunityRatePerMile,
  isActiveBroker,
  isDirectShipperLead,
  isHotMarket,
  isOpenOpportunity,
} from "@/lib/load-acquisition-core";
export type { AcquisitionSummary } from "@/lib/load-acquisition-core";

export function formatOpportunityRatePerMile(ratePerMile: number | null | undefined) {
  return formatRatePerMile(ratePerMile);
}

export function formatFuelEstimatedCost(estimatedCost: number | null | undefined) {
  return estimatedCost === null || estimatedCost === undefined ? "Not available" : formatCurrency(estimatedCost, true);
}
