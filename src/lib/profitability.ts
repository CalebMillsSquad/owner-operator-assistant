import type { Expense, Load } from "@prisma/client";

export type LoadWithExpenses = Load & { expenses: Expense[] };

export type LoadProfitSnapshot = {
  revenue: number;
  loadedMiles: number | null;
  deadheadMiles: number | null;
  totalMiles: number | null;
  revenuePerLoadedMile: number | null;
  revenuePerTotalMile: number | null;
  linkedExpenseTotal: number;
  net: number;
  netPerTotalMile: number | null;
  status: "Strong" | "Watch" | "At Risk" | "Missing Data";
  missingFields: string[];
};

export type ExpenseCategoryTotal = {
  category: string;
  amount: number;
};

export type WeeklySummary = {
  start: Date;
  end: Date;
  loads: LoadWithExpenses[];
  expenses: Expense[];
  loadRevenue: number;
  expenseTotal: number;
  net: number;
  totalLoadedMiles: number;
  totalDeadheadMiles: number;
  totalMiles: number;
  revenueWithMiles: number;
  revenuePerTotalMile: number | null;
  operatingMargin: number | null;
  completedLoadCount: number;
  fuelExpenseTotal: number;
  otherExpenseTotal: number;
  categoryTotals: ExpenseCategoryTotal[];
};

export function calculateRatePerMile(rate: number | null | undefined, miles: number | null | undefined) {
  if (rate === null || rate === undefined || rate < 0 || miles === null || miles === undefined || miles <= 0) {
    return null;
  }

  return rate / miles;
}

export function calculateLoadProfit(load: LoadWithExpenses): LoadProfitSnapshot {
  const revenue = load.rate !== null && load.rate !== undefined && load.rate >= 0 ? load.rate : 0;
  const loadedMilesValue = load.loadedMiles ?? load.miles;
  const loadedMiles = loadedMilesValue !== null && loadedMilesValue !== undefined && loadedMilesValue > 0 ? loadedMilesValue : null;
  const deadheadMiles = load.deadheadMiles !== null && load.deadheadMiles !== undefined && load.deadheadMiles >= 0 ? load.deadheadMiles : null;
  const totalMiles = loadedMiles !== null ? loadedMiles + (deadheadMiles ?? 0) : null;
  const linkedExpenseTotal = load.expenses.reduce((sum, expense) => sum + Math.max(0, expense.amount), 0);
  const missingFields: string[] = [];

  if (load.rate === null || load.rate === undefined || load.rate < 0) {
    missingFields.push("rate");
  }

  if (loadedMiles === null) {
    missingFields.push("loaded miles");
  }

  if (deadheadMiles === null) missingFields.push("deadhead miles");
  const net = revenue - linkedExpenseTotal;
  const revenuePerLoadedMile = calculateRatePerMile(load.rate, loadedMiles);
  const revenuePerTotalMile = calculateRatePerMile(load.rate, totalMiles);
  const netPerTotalMile = calculateRatePerMile(net, totalMiles);
  const status = missingFields.length > 0 || load.rate === null || load.rate === undefined
    ? "Missing Data"
    : net < 0 ? "At Risk" : revenuePerTotalMile !== null && revenuePerTotalMile < 1.5 ? "Watch" : "Strong";

  return {
    revenue,
    loadedMiles,
    deadheadMiles,
    totalMiles,
    revenuePerLoadedMile,
    revenuePerTotalMile,
    linkedExpenseTotal,
    net,
    netPerTotalMile,
    status,
    missingFields,
  };
}

export function startOfCurrentWeek(now = new Date()) {
  const start = new Date(now);
  const day = start.getDay();
  const daysFromMonday = day === 0 ? 6 : day - 1;
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - daysFromMonday);
  return start;
}

export function endOfCurrentWeek(now = new Date()) {
  const end = startOfCurrentWeek(now);
  end.setDate(end.getDate() + 7);
  return end;
}

export function isInCurrentWeek(date: Date | null | undefined, now = new Date()) {
  if (!date) {
    return false;
  }

  const start = startOfCurrentWeek(now);
  const end = endOfCurrentWeek(now);
  const timestamp = date.getTime();
  return timestamp >= start.getTime() && timestamp < end.getTime();
}

export function loadAccountingDate(load: Load) {
  return load.deliveryDate ?? load.pickupDate ?? load.createdAt;
}

export function summarizeExpenseCategories(expenses: Expense[]) {
  const totals = expenses.reduce<Record<string, number>>((accumulator, expense) => {
    accumulator[expense.category] = (accumulator[expense.category] ?? 0) + expense.amount;
    return accumulator;
  }, {});

  return Object.entries(totals)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);
}

export function calculateWeeklySummary(loads: LoadWithExpenses[], expenses: Expense[], now = new Date()): WeeklySummary {
  const weeklyLoads = loads.filter((load) => load.status !== "CANCELLED" && isInCurrentWeek(loadAccountingDate(load), now));
  const weeklyExpenses = expenses.filter((expense) => isInCurrentWeek(expense.expenseDate, now));
  const loadsWithMiles = weeklyLoads.filter((load) => calculateLoadProfit(load).revenuePerTotalMile !== null);
  const revenueWithMiles = loadsWithMiles.reduce((sum, load) => sum + Math.max(0, load.rate ?? 0), 0);
  const snapshots = weeklyLoads.map(calculateLoadProfit);
  const totalLoadedMiles = snapshots.reduce((sum, item) => sum + (item.loadedMiles ?? 0), 0);
  const totalDeadheadMiles = snapshots.reduce((sum, item) => sum + (item.deadheadMiles ?? 0), 0);
  const totalMiles = snapshots.reduce((sum, item) => sum + (item.totalMiles ?? 0), 0);
  const loadRevenue = weeklyLoads.reduce((sum, load) => sum + Math.max(0, load.rate ?? 0), 0);
  const expenseTotal = weeklyExpenses.reduce((sum, expense) => sum + Math.max(0, expense.amount), 0);
  const fuelExpenseTotal = weeklyExpenses.filter((expense) => expense.category === "FUEL").reduce((sum, expense) => sum + Math.max(0, expense.amount), 0);

  return {
    start: startOfCurrentWeek(now),
    end: endOfCurrentWeek(now),
    loads: weeklyLoads,
    expenses: weeklyExpenses,
    loadRevenue,
    expenseTotal,
    net: loadRevenue - expenseTotal,
    totalLoadedMiles,
    totalDeadheadMiles,
    totalMiles,
    revenueWithMiles,
    revenuePerTotalMile: calculateRatePerMile(revenueWithMiles, totalMiles),
    operatingMargin: loadRevenue > 0 ? ((loadRevenue - expenseTotal) / loadRevenue) * 100 : null,
    completedLoadCount: weeklyLoads.filter((load) => load.status === "DELIVERED").length,
    fuelExpenseTotal,
    otherExpenseTotal: expenseTotal - fuelExpenseTotal,
    categoryTotals: summarizeExpenseCategories(weeklyExpenses),
  };
}

export function activeLoads<T extends Pick<Load, "status">>(loads: T[]) {
  return loads.filter((load) => load.status !== "DELIVERED" && load.status !== "CANCELLED");
}
