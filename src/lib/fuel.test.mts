import assert from "node:assert/strict";
import test from "node:test";

import { calculateFuelTotal, summarizeFuelPurchases } from "./fuel.ts";

test("calculates fuel total and rounds to currency precision", () => {
  assert.equal(calculateFuelTotal(52.4, 3.679), 192.78);
});

test("rejects unusable gallons and prices", () => {
  assert.throws(() => calculateFuelTotal(0, 3.5), /Gallons must be greater than zero/);
  assert.throws(() => calculateFuelTotal(50, Number.NaN), /Price per gallon must be greater than zero/);
});

test("summarizes fuel purchases using weighted average price", () => {
  const summary = summarizeFuelPurchases([
    { gallons: 50, totalCost: 175 },
    { gallons: 25, totalCost: 100 },
  ]);

  assert.deepEqual(summary, {
    gallons: 75,
    totalCost: 275,
    averagePricePerGallon: 275 / 75,
    purchaseCount: 2,
  });
});

test("returns no average for an empty fuel history", () => {
  assert.deepEqual(summarizeFuelPurchases([]), {
    gallons: 0,
    totalCost: 0,
    averagePricePerGallon: null,
    purchaseCount: 0,
  });
});

