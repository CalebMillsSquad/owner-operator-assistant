import test from "node:test";
import assert from "node:assert/strict";
import { assessCompatibility, calculateFreightProfitability, decideFreightOpportunity, suggestedCounterRate } from "./freight-intelligence.ts";

test("rejects cargo van for heavy 48-foot freight", () => {
  const result = assessCompatibility({ requiredEquipmentType: "DRY_VAN_48", weightPounds: 48000, requiredLengthFeet: 48 }, { equipmentType: "CARGO_VAN", maximumPayloadPounds: 3400, cargoLengthFeet: 12 });
  assert.equal(result.status, "INCOMPATIBLE");
  assert.ok(result.reasons.some((reason) => reason.includes("exceeds maximum payload")));
});

test("does not silently accept missing equipment capability", () => {
  const result = assessCompatibility({ weightPounds: 500, requiredLengthFeet: 26 }, { equipmentType: "CARGO_VAN", maximumPayloadPounds: 3400 });
  assert.equal(result.status, "REVIEW_REQUIRED");
});

test("profitability includes deadhead, loaded, and reposition miles", () => {
  const result = calculateFreightProfitability({ rate: 1000, loadedMiles: 400, deadheadMiles: 50, repositionMiles: 25, estimatedMpg: 10, estimatedFuelPrice: 4, estimatedTolls: 20, dispatchPercent: 10, maintenancePerMile: 0.1, estimatedOtherExpenses: 10 });
  assert.equal(result.totalOperationalMiles, 475);
  assert.equal(result.estimatedFuelGallons, 47.5);
  assert.equal(result.dispatchFee, 100);
  assert.equal(result.maintenanceReserve, 47.5);
});

test("missing and zero values never divide by zero", () => {
  assert.equal(calculateFreightProfitability({ rate: 1000, loadedMiles: 0 }).effectiveGrossRatePerMile, null);
  assert.equal(calculateFreightProfitability({ loadedMiles: 400 }).estimateStatus, "CALCULATION_UNAVAILABLE");
});

test("suggested counter rounds to a practical increment", () => {
  assert.equal(suggestedCounterRate(1.75, 700), 1225);
});

test("decision reasons expose deadhead, stops, and missing schedule", () => {
  const result = decideFreightOpportunity({ compatibility: "COMPATIBLE", profit: calculateFreightProfitability({ rate: 1400, loadedMiles: 500 }), deadheadMiles: 75, stopCount: 2, pickupDate: null, deliveryDate: null, brokerVerified: true });
  assert.ok(result.reasons.some((reason) => reason.includes("deadhead")));
  assert.ok(result.reasons.some((reason) => reason.includes("stops")));
  assert.ok(result.reasons.some((reason) => reason.includes("schedule")));
});
