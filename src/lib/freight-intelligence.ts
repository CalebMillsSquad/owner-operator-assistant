export type EquipmentInput = {
  equipmentType: string;
  maximumPayloadPounds?: number | null;
  cargoLengthFeet?: number | null;
  palletCapacity?: number | null;
  doorWidthInches?: number | null;
  doorHeightInches?: number | null;
};

export type FreightInput = {
  requiredEquipmentType?: string | null;
  weightPounds?: number | null;
  requiredLengthFeet?: number | null;
  palletCount?: number | null;
};

export function assessCompatibility(freight: FreightInput, equipment: EquipmentInput | null) {
  if (!equipment) return { status: "REVIEW_REQUIRED" as const, reasons: ["No active equipment profile is selected."] };
  const reasons: string[] = [];
  let incompatible = false;
  if (freight.requiredEquipmentType && freight.requiredEquipmentType !== equipment.equipmentType && freight.requiredEquipmentType !== "OTHER") {
    incompatible = true;
    reasons.push(`Required equipment is ${freight.requiredEquipmentType.replaceAll("_", " ")}; current equipment is ${equipment.equipmentType.replaceAll("_", " ")}.`);
  }
  if (freight.weightPounds != null && equipment.maximumPayloadPounds == null) reasons.push("Maximum payload is not configured; confirm vehicle and trailer ratings.");
  if (freight.weightPounds != null && equipment.maximumPayloadPounds != null && freight.weightPounds > equipment.maximumPayloadPounds) {
    incompatible = true;
    reasons.push(`Freight weight ${freight.weightPounds.toLocaleString()} lb exceeds maximum payload ${equipment.maximumPayloadPounds.toLocaleString()} lb.`);
  }
  if (freight.requiredLengthFeet != null && equipment.cargoLengthFeet == null) reasons.push("Cargo-space length is not configured; confirm the required length manually.");
  if (freight.requiredLengthFeet != null && equipment.cargoLengthFeet != null && freight.requiredLengthFeet > equipment.cargoLengthFeet) {
    incompatible = true;
    reasons.push(`Required cargo length ${freight.requiredLengthFeet} ft exceeds available ${equipment.cargoLengthFeet} ft.`);
  }
  if (freight.palletCount != null && equipment.palletCapacity == null) reasons.push("Pallet capacity is not configured; confirm the pallet layout manually.");
  if (freight.palletCount != null && equipment.palletCapacity != null && freight.palletCount > equipment.palletCapacity) {
    incompatible = true;
    reasons.push(`Pallet count ${freight.palletCount} exceeds capacity ${equipment.palletCapacity}.`);
  }
  return { status: incompatible ? "INCOMPATIBLE" as const : reasons.length ? "REVIEW_REQUIRED" as const : "COMPATIBLE" as const, reasons: reasons.length ? reasons : ["Known freight requirements fit the selected equipment."] };
}

export type ProfitabilityInput = {
  rate?: number | null; loadedMiles?: number | null; deadheadMiles?: number | null; repositionMiles?: number | null;
  estimatedMpg?: number | null; estimatedFuelPrice?: number | null; estimatedTolls?: number | null;
  dispatchPercent?: number | null; maintenancePerMile?: number | null; insurancePerWeek?: number | null;
  paymentPerWeek?: number | null; estimatedOtherExpenses?: number | null; workingLoadsPerWeek?: number | null;
};

export function calculateFreightProfitability(input: ProfitabilityInput) {
  const rate = input.rate != null && input.rate >= 0 ? input.rate : null;
  const loaded = input.loadedMiles != null && input.loadedMiles >= 0 ? input.loadedMiles : null;
  const deadhead = input.deadheadMiles != null && input.deadheadMiles >= 0 ? input.deadheadMiles : 0;
  const reposition = input.repositionMiles != null && input.repositionMiles >= 0 ? input.repositionMiles : 0;
  const totalMiles = loaded == null ? null : loaded + deadhead + reposition;
  const fuelGallons = totalMiles != null && input.estimatedMpg && input.estimatedMpg > 0 ? totalMiles / input.estimatedMpg : null;
  const fuelCost = fuelGallons != null && input.estimatedFuelPrice != null && input.estimatedFuelPrice >= 0 ? fuelGallons * input.estimatedFuelPrice : null;
  const dispatchFee = rate != null && input.dispatchPercent != null && input.dispatchPercent >= 0 ? rate * input.dispatchPercent / 100 : null;
  const maintenance = totalMiles != null && input.maintenancePerMile != null && input.maintenancePerMile >= 0 ? totalMiles * input.maintenancePerMile : null;
  const loads = input.workingLoadsPerWeek && input.workingLoadsPerWeek > 0 ? input.workingLoadsPerWeek : null;
  const fixed = loads ? ((input.insurancePerWeek ?? 0) + (input.paymentPerWeek ?? 0)) / loads : 0;
  const knownCosts = [fuelCost, input.estimatedTolls, dispatchFee, maintenance, input.estimatedOtherExpenses].every((value) => value != null);
  const projectedNetProfit = rate != null && knownCosts ? rate - fuelCost! - (input.estimatedTolls ?? 0) - dispatchFee! - maintenance! - (input.estimatedOtherExpenses ?? 0) - fixed : null;
  return {
    totalOperationalMiles: totalMiles,
    loadedRatePerMile: rate != null && loaded && loaded > 0 ? rate / loaded : null,
    effectiveGrossRatePerMile: rate != null && totalMiles && totalMiles > 0 ? rate / totalMiles : null,
    estimatedFuelGallons: fuelGallons, estimatedFuelCost: fuelCost, dispatchFee, maintenanceReserve: maintenance,
    allocatedFixedCost: fixed, projectedNetProfit, projectedNetRatePerMile: projectedNetProfit != null && totalMiles ? projectedNetProfit / totalMiles : null,
    estimateStatus: rate == null || loaded == null ? "CALCULATION_UNAVAILABLE" : knownCosts ? "COMPLETE_ESTIMATE" : "PARTIAL_ESTIMATE",
  };
}

export function suggestedCounterRate(targetEffectiveRpm: number | null | undefined, totalMiles: number | null | undefined) {
  if (!targetEffectiveRpm || !totalMiles || targetEffectiveRpm < 0 || totalMiles <= 0) return null;
  return Math.ceil((targetEffectiveRpm * totalMiles) / 25) * 25;
}

export function decideFreightOpportunity(args: { compatibility: "COMPATIBLE" | "INCOMPATIBLE" | "REVIEW_REQUIRED"; profit: ReturnType<typeof calculateFreightProfitability>; walkAwayRate?: number | null; minimumEffectiveRpm?: number | null; minimumProjectedProfit?: number | null; brokerVerified?: boolean; pickupDate?: Date | null; deadheadMiles?: number | null; stopCount?: number | null; deliveryDate?: Date | null }) {
  const reasons: string[] = [];
  if (args.compatibility === "INCOMPATIBLE") return { recommendation: "INCOMPATIBLE", reasons: ["Equipment requirements do not fit the selected profile."] };
  if (args.compatibility === "REVIEW_REQUIRED") reasons.push("Equipment or freight information needs manual confirmation.");
  if (args.profit.estimateStatus === "CALCULATION_UNAVAILABLE") return { recommendation: "INSUFFICIENT_INFORMATION", reasons: [...reasons, "A valid rate and loaded miles are required."] };
  if (args.deadheadMiles != null && args.deadheadMiles > 50) reasons.push(`Pickup deadhead is ${args.deadheadMiles.toLocaleString()} miles.`);
  if (args.stopCount != null && args.stopCount > 1) reasons.push(`${args.stopCount} stops require additional appointment and time confirmation.`);
  if (!args.pickupDate || !args.deliveryDate) reasons.push("Pickup or delivery schedule is incomplete.");
  if (args.walkAwayRate != null && args.profit.projectedNetProfit != null && args.profit.effectiveGrossRatePerMile != null && args.profit.effectiveGrossRatePerMile < args.walkAwayRate) reasons.push("Current offer is below the driver-authorized walk-away rate.");
  if (!args.brokerVerified) reasons.push("Broker is not marked verified.");
  if (args.minimumEffectiveRpm != null && (args.profit.effectiveGrossRatePerMile ?? 0) < args.minimumEffectiveRpm) reasons.push("Effective gross RPM is below the configured minimum.");
  if (args.minimumProjectedProfit != null && (args.profit.projectedNetProfit ?? 0) < args.minimumProjectedProfit) reasons.push("Projected net profit is below the configured minimum.");
  if (reasons.some((reason) => reason.includes("below"))) return { recommendation: "NEGOTIATE", reasons };
  return { recommendation: reasons.length ? "CONSIDER" : "STRONG_CANDIDATE", reasons: reasons.length ? reasons : ["Known requirements and configured profitability thresholds are satisfied."] };
}
