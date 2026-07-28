import assert from "node:assert/strict";
import test from "node:test";

import { calculateLoadProfit, calculateRatePerMile, calculateWeeklySummary } from "./profitability.ts";

const load = (overrides: Record<string, unknown> = {}) => ({
  id: "load-1", workspaceId: "local-workspace", loadNumber: "1042", broker: "Broker", origin: "Memphis", destination: "Dallas",
  miles: 500, loadedMiles: 450, deadheadMiles: 50, rate: 2250, ratePerMile: 5, status: "DELIVERED" as const,
  pickupDate: new Date("2026-07-20T12:00:00Z"), deliveryDate: new Date("2026-07-21T12:00:00Z"), commodity: null, weightPounds: null, notes: null,
  deletedAt: null, createdAt: new Date("2026-07-20T12:00:00Z"), updatedAt: new Date("2026-07-20T12:00:00Z"),
  expenses: [{ id: "expense-1", workspaceId: "local-workspace", loadId: "load-1", category: "FUEL" as const, amount: 450, expenseDate: new Date("2026-07-21T12:00:00Z"), vendor: null, location: null, notes: null, receiptPath: null, deletedAt: null, createdAt: new Date(), updatedAt: new Date() }],
  ...overrides,
});

test("calculates loaded, total, net, and per-mile profitability", () => {
  const result = calculateLoadProfit(load());
  assert.equal(result.totalMiles, 500);
  assert.equal(result.revenuePerLoadedMile, 5);
  assert.equal(result.revenuePerTotalMile, 4.5);
  assert.equal(result.net, 1800);
  assert.equal(result.netPerTotalMile, 3.6);
  assert.equal(result.status, "Strong");
});

test("protects zero and missing mileage", () => {
  assert.equal(calculateRatePerMile(100, 0), null);
  const result = calculateLoadProfit(load({ rate: null, loadedMiles: 0, miles: 0, deadheadMiles: null }));
  assert.equal(result.revenuePerTotalMile, null);
  assert.equal(result.status, "Missing Data");
});

test("does not turn negative rates, miles, or expenses into profitability", () => {
  const result = calculateLoadProfit(load({ rate: -100, loadedMiles: -10, miles: -10, deadheadMiles: -5, expenses: [{ ...load().expenses[0], amount: -40 }] }));
  assert.equal(result.revenue, 0);
  assert.equal(result.totalMiles, null);
  assert.equal(result.linkedExpenseTotal, 0);
  assert.equal(result.status, "Missing Data");
});

test("weekly summary uses delivery-week loads and counts linked expenses once", () => {
  const generalExpense = { ...load().expenses[0], id: "expense-general", loadId: null, category: "TOLLS" as const, amount: 100 };
  const result = calculateWeeklySummary([load()], [load().expenses[0], generalExpense], new Date("2026-07-22T12:00:00Z"));
  assert.equal(result.loadRevenue, 2250);
  assert.equal(result.expenseTotal, 550);
  assert.equal(result.net, 1700);
  assert.equal(result.totalLoadedMiles, 450);
  assert.equal(result.totalDeadheadMiles, 50);
  assert.equal(result.totalMiles, 500);
  assert.equal(result.fuelExpenseTotal, 450);
  assert.equal(result.otherExpenseTotal, 100);
});

test("loads delivered outside the selected week are excluded", () => {
  const result = calculateWeeklySummary([load({ deliveryDate: new Date("2026-07-30T12:00:00Z") })], [], new Date("2026-07-22T12:00:00Z"));
  assert.equal(result.loads.length, 0);
});

test("cancelled loads are excluded from weekly revenue", () => {
  const result = calculateWeeklySummary([load({ status: "CANCELLED" })], [], new Date("2026-07-22T12:00:00Z"));
  assert.equal(result.loadRevenue, 0);
  assert.equal(result.loads.length, 0);
});
