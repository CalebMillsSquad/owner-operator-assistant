import type { FuelLog } from "@prisma/client";

export type FuelPurchaseSummary = {
  gallons: number;
  totalCost: number;
  averagePricePerGallon: number | null;
  purchaseCount: number;
};

export function calculateFuelTotal(gallons: number, pricePerGallon: number) {
  if (!Number.isFinite(gallons) || gallons <= 0) {
    throw new Error("Gallons must be greater than zero.");
  }

  if (!Number.isFinite(pricePerGallon) || pricePerGallon <= 0) {
    throw new Error("Price per gallon must be greater than zero.");
  }

  return Math.round((gallons * pricePerGallon + Number.EPSILON) * 100) / 100;
}

export function summarizeFuelPurchases(
  purchases: Array<Pick<FuelLog, "gallons" | "totalCost">>,
): FuelPurchaseSummary {
  const gallons = purchases.reduce((sum, purchase) => sum + purchase.gallons, 0);
  const totalCost = purchases.reduce((sum, purchase) => sum + purchase.totalCost, 0);

  return {
    gallons,
    totalCost,
    averagePricePerGallon: gallons > 0 ? totalCost / gallons : null,
    purchaseCount: purchases.length,
  };
}

