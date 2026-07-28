"use server";

import { revalidatePath } from "next/cache.js";
import { redirect } from "next/navigation.js";

import { DOT_INSPECTION_ITEMS } from "@/lib/inspections";
import { calculateFuelTotal } from "@/lib/fuel";
import { calculateFuelEstimatedCost, calculateOpportunityRatePerMile } from "@/lib/load-acquisition";
import { applyCurrentMileageToOpenMaintenance, calculateMaintenanceStatus } from "@/lib/maintenance";
import { prisma } from "@/lib/prisma";
import { calculateRatePerMile } from "@/lib/profitability";
import { type AuditLogInput } from "@/lib/recovery";
import { getAuditActorLabel, requireOperatorRole } from "@/lib/auth";
import {
  runRestoreWithUserFeedback,
} from "@/lib/recover-actions";

function parseDateInput(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) {
    return new Date(value);
  }

  return new Date(year, month - 1, day, 12);
}

function redirectRestoreError(entityType: string, message: string) {
  redirect(
    `/audit-log?restore=error&restoreEntity=${encodeURIComponent(entityType)}&restoreMessage=${encodeURIComponent(message)}`,
  );
}

function redirectRestoreSuccess(entityType: string) {
  redirect(`/audit-log?restore=ok&restoreEntity=${encodeURIComponent(entityType)}`);
}

const softDeleteMetadata = {
  action: "SOFT_DELETE",
  reason: "Manual deletion from UI",
};

async function createAuditLog({
  entityType,
  entityId,
  action = softDeleteMetadata.action,
  actor,
  reason = softDeleteMetadata.reason,
  details,
}: AuditLogInput) {
  const auditActor = actor && actor !== "system" ? actor : await getAuditActorLabel();

  await prisma.auditLog.create({
    data: {
      entityType,
      entityId,
      action,
      actor: auditActor,
      reason,
      details,
    },
  });
}

async function requireWriteAccess() {
  return requireOperatorRole("TESTER");
}

async function requireRecoveryAccess() {
  return requireOperatorRole("OWNER");
}

function parseOptionalNumber(value: FormDataEntryValue | null) {
  const parsedValue = typeof value === "string" && value.trim() ? parseFloat(value) : null;
  return Number.isFinite(parsedValue) ? parsedValue : null;
}

function optionalString(value: FormDataEntryValue | null) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function parseRequiredNumber(value: FormDataEntryValue | null, label: string) {
  const parsedValue = parseOptionalNumber(value);
  if (parsedValue === null) {
    throw new Error(`${label} is required.`);
  }

  return parsedValue;
}

function calculateDocumentAlertStatus(expiresDate: Date | null): "CURRENT" | "EXPIRING_SOON" | "EXPIRED" | "MISSING" {
  if (!expiresDate) {
    return "MISSING";
  }

  const daysOut = (expiresDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  if (daysOut < 0) {
    return "EXPIRED";
  }

  if (daysOut < 60) {
    return "EXPIRING_SOON";
  }

  return "CURRENT";
}

function revalidateOperationsPaths() {
  revalidatePath("/");
  revalidatePath("/loads");
  revalidatePath("/expenses");
  revalidatePath("/fuel");
  revalidatePath("/documents");
  revalidatePath("/summary");
  revalidatePath("/profitability");
  revalidatePath("/maintenance");
  revalidatePath("/inspections");
  revalidatePath("/assistant");
}

function revalidateLoadAcquisitionPaths() {
  revalidatePath("/");
  revalidatePath("/load-acquisition");
  revalidatePath("/load-acquisition/opportunities");
  revalidatePath("/load-acquisition/opportunities/new");
  revalidatePath("/load-acquisition/markets");
  revalidatePath("/load-acquisition/brokers");
  revalidatePath("/load-acquisition/carrier-network");
  revalidatePath("/load-acquisition/shippers");
  revalidatePath("/load-acquisition/fuel-stops");
  revalidatePath("/assistant");
}

function revalidateRecoveryPaths() {
  revalidatePath("/audit-log");
}

export async function createLoadAction(formData: FormData) {
  await requireWriteAccess();
  const origin = formData.get("origin") as string;
  const destination = formData.get("destination") as string;
  const broker = formData.get("broker") as string;
  const commodity = formData.get("commodity") as string;
  const rateStr = formData.get("rate") as string;
  const milesStr = formData.get("miles") as string;
  const loadedMiles = parseOptionalNumber(formData.get("loadedMiles")) ?? (milesStr ? parseFloat(milesStr) : null);
  const deadheadMiles = parseOptionalNumber(formData.get("deadheadMiles"));
  const pickupDate = parseDateInput(formData.get("pickupDate") as string);
  const deliveryDate = parseDateInput(formData.get("deliveryDate") as string);
  const rate = rateStr ? parseFloat(rateStr) : null;
  const ratePerMile = calculateRatePerMile(rate, loadedMiles);

  await prisma.load.create({
    data: { origin, destination, broker: broker || null, commodity: commodity || null, rate, miles: loadedMiles, loadedMiles, deadheadMiles, ratePerMile, pickupDate, deliveryDate },
  });

  revalidatePath("/");
  revalidatePath("/loads");
  revalidatePath("/summary");
  revalidatePath("/profitability");
  revalidatePath("/assistant");
}

export async function updateLoadAction(id: string, formData: FormData) {
  await requireWriteAccess();
  const rate = parseOptionalNumber(formData.get("rate"));
  const miles = parseOptionalNumber(formData.get("miles"));
  const loadedMiles = parseOptionalNumber(formData.get("loadedMiles")) ?? miles;
  const deadheadMiles = parseOptionalNumber(formData.get("deadheadMiles"));
  const status = formData.get("status") as "BOOKED" | "IN_TRANSIT" | "DELIVERED" | "CANCELLED";

  await prisma.load.update({
    where: { id },
    data: {
      loadNumber: optionalString(formData.get("loadNumber")),
      origin: String(formData.get("origin") ?? "").trim(),
      destination: String(formData.get("destination") ?? "").trim(),
      broker: optionalString(formData.get("broker")),
      commodity: optionalString(formData.get("commodity")),
      pickupDate: parseDateInput(String(formData.get("pickupDate") ?? "")),
      deliveryDate: parseDateInput(String(formData.get("deliveryDate") ?? "")),
      rate,
      miles: loadedMiles,
      loadedMiles,
      deadheadMiles,
      ratePerMile: calculateRatePerMile(rate, loadedMiles),
      status: status || "BOOKED",
      notes: optionalString(formData.get("notes")),
    },
  });

  revalidateOperationsPaths();
}

export async function restoreLoadAction(id: string) {
  await requireRecoveryAccess();
  const restoreResult = await runRestoreWithUserFeedback({
    id,
    entityType: "Load",
    notFoundMessage: "Load not found.",
    notDeletedMessage: "Load is not deleted.",
    findRecord: (recordId) => prisma.load.findUnique({ where: { id: recordId } }),
    restoreRecord: (recordId) => prisma.load.update({ where: { id: recordId }, data: { deletedAt: null } }),
    createAuditLog,
    details: (load) => `Load ${load.origin} to ${load.destination} restored.`,
  });

  if (restoreResult.status === "error" && restoreResult.message) {
    redirectRestoreError("Load", restoreResult.message);
  }

  revalidateOperationsPaths();
  revalidateRecoveryPaths();
  redirectRestoreSuccess("Load");
}

export async function updateLoadStatusAction(id: string, status: "BOOKED" | "IN_TRANSIT" | "DELIVERED" | "CANCELLED") {
  await requireWriteAccess();
  await prisma.load.update({ where: { id, deletedAt: null }, data: { status } });

  revalidatePath("/");
  revalidatePath("/loads");
  revalidatePath("/summary");
  revalidatePath("/profitability");
  revalidatePath("/assistant");
}

export async function deleteLoadAction(id: string) {
  await requireRecoveryAccess();
  const deletedAt = new Date();
  const load = await prisma.load.update({
    where: { id },
    data: { deletedAt },
  });
  await createAuditLog({
    entityType: "Load",
    entityId: load.id,
    details: `Load ${load.origin} to ${load.destination} (deletedAt=${deletedAt.toISOString()})`,
  });

  revalidateOperationsPaths();
}


export async function createExpenseAction(formData: FormData) {
  await requireWriteAccess();
  const category = formData.get("category") as
    | "FUEL"
    | "OIL"
    | "TIRES"
    | "REPAIRS"
    | "TOLLS"
    | "SCALES"
    | "PERMITS"
    | "INSURANCE"
    | "FOOD"
    | "OTHER";
  const amount = parseFloat(formData.get("amount") as string);
  const expenseDate = parseDateInput(formData.get("expenseDate") as string);
  const vendor = formData.get("vendor") as string;
  const location = optionalString(formData.get("location"));
  const notes = formData.get("notes") as string;
  const loadId = formData.get("loadId") as string;
  const receiptPath = optionalString(formData.get("receiptPath"));

  if (!expenseDate) {
    throw new Error("Expense date is required.");
  }

  await prisma.expense.create({
    data: { category, amount, expenseDate, vendor: vendor || null, location, notes: notes || null, receiptPath, loadId: loadId || null },
  });

  revalidatePath("/");
  revalidatePath("/expenses");
  revalidatePath("/summary");
  revalidatePath("/profitability");
  revalidatePath("/assistant");
}

export async function updateExpenseAction(id: string, formData: FormData) {
  await requireWriteAccess();
  const category = formData.get("category") as
    | "FUEL"
    | "OIL"
    | "TIRES"
    | "REPAIRS"
    | "TOLLS"
    | "SCALES"
    | "PERMITS"
    | "INSURANCE"
    | "FOOD"
    | "OTHER";
  const expenseDate = parseDateInput(String(formData.get("expenseDate") ?? ""));

  if (!expenseDate) {
    throw new Error("Expense date is required.");
  }

  await prisma.expense.update({
    where: { id },
    data: {
      category,
      amount: parseRequiredNumber(formData.get("amount"), "Expense amount"),
      expenseDate,
      vendor: optionalString(formData.get("vendor")),
      location: optionalString(formData.get("location")),
      notes: optionalString(formData.get("notes")),
      receiptPath: optionalString(formData.get("receiptPath")),
      loadId: optionalString(formData.get("loadId")),
    },
  });

  revalidateOperationsPaths();
}

export async function restoreExpenseAction(id: string) {
  await requireRecoveryAccess();
  const restoreResult = await runRestoreWithUserFeedback({
    id,
    entityType: "Expense",
    notFoundMessage: "Expense not found.",
    notDeletedMessage: "Expense is not deleted.",
    findRecord: (recordId) =>
      prisma.expense.findUnique({
        where: { id: recordId },
        select: {
          id: true,
          category: true,
          amount: true,
          deletedAt: true,
          fuelLog: { select: { id: true, deletedAt: true } },
        },
      }),
    restoreRecord: async (recordId) => {
      const expense = await prisma.expense.findUnique({
        where: { id: recordId },
        select: { fuelLog: { select: { id: true } } },
      });
      return prisma.$transaction(async (transaction) => {
        await transaction.expense.update({ where: { id: recordId }, data: { deletedAt: null } });
        if (expense?.fuelLog) {
          await transaction.fuelLog.update({ where: { id: expense.fuelLog.id }, data: { deletedAt: null } });
        }
      });
    },
    createAuditLog,
    details: (expense) => `Expense ${expense.category} ${expense.amount} restored.`,
  });

  if (restoreResult.status === "error" && restoreResult.message) {
    redirectRestoreError("Expense", restoreResult.message);
  }

  revalidateOperationsPaths();
  revalidateRecoveryPaths();
  redirectRestoreSuccess("Expense");
}

export async function deleteExpenseAction(id: string) {
  await requireRecoveryAccess();
  const deletedAt = new Date();
  const expense = await prisma.expense.findUnique({
    where: { id, deletedAt: null },
    include: { load: true, fuelLog: true },
  });

  if (!expense) {
    throw new Error("Expense not found.");
  }

  await prisma.$transaction(async (transaction) => {
    await transaction.expense.update({ where: { id }, data: { deletedAt } });
    if (expense.fuelLog) {
      await transaction.fuelLog.update({ where: { id: expense.fuelLog.id }, data: { deletedAt } });
    }
  });

  await createAuditLog({
    entityType: "Expense",
    entityId: expense.id,
    details: `Expense ${expense.category} ${expense.amount} (loadId=${expense.load?.id ?? "unlinked"}, deletedAt=${deletedAt.toISOString()})`,
  });

  revalidateOperationsPaths();
}

function parseFuelPurchase(formData: FormData) {
  const fuelDate = parseDateInput(String(formData.get("fuelDate") ?? ""));
  if (!fuelDate) {
    throw new Error("Fuel date is required.");
  }

  const gallons = parseRequiredNumber(formData.get("gallons"), "Gallons");
  const pricePerGallon = parseRequiredNumber(formData.get("pricePerGallon"), "Price per gallon");

  return {
    fuelDate,
    gallons,
    pricePerGallon,
    totalCost: calculateFuelTotal(gallons, pricePerGallon),
    vendor: optionalString(formData.get("vendor")),
    location: optionalString(formData.get("location")),
    state: optionalString(formData.get("state"))?.toUpperCase() ?? null,
    odometer: parseOptionalNumber(formData.get("odometer")),
    receiptReference: optionalString(formData.get("receiptReference")),
    loadId: optionalString(formData.get("loadId")),
    notes: optionalString(formData.get("notes")),
  };
}

export async function createFuelLogAction(formData: FormData) {
  await requireWriteAccess();
  const data = parseFuelPurchase(formData);

  await prisma.$transaction(async (transaction) => {
    const expense = await transaction.expense.create({
      data: {
        category: "FUEL",
        amount: data.totalCost,
        expenseDate: data.fuelDate,
        vendor: data.vendor,
        location: data.location,
        notes: data.notes,
        receiptPath: data.receiptReference,
        loadId: data.loadId,
      },
    });

    await transaction.fuelLog.create({
      data: { ...data, expenseId: expense.id },
    });
  });

  revalidateOperationsPaths();
}

export async function updateFuelLogAction(id: string, formData: FormData) {
  await requireWriteAccess();
  const data = parseFuelPurchase(formData);
  const existing = await prisma.fuelLog.findUnique({ where: { id, deletedAt: null } });

  if (!existing) {
    throw new Error("Fuel purchase not found.");
  }

  await prisma.$transaction(async (transaction) => {
    let expenseId = existing.expenseId;

    if (expenseId) {
      await transaction.expense.update({
        where: { id: expenseId },
        data: {
          category: "FUEL",
          amount: data.totalCost,
          expenseDate: data.fuelDate,
          vendor: data.vendor,
          location: data.location,
          notes: data.notes,
          receiptPath: data.receiptReference,
          loadId: data.loadId,
          deletedAt: null,
        },
      });
    } else {
      const expense = await transaction.expense.create({
        data: {
          category: "FUEL",
          amount: data.totalCost,
          expenseDate: data.fuelDate,
          vendor: data.vendor,
          location: data.location,
          notes: data.notes,
          receiptPath: data.receiptReference,
          loadId: data.loadId,
        },
      });
      expenseId = expense.id;
    }

    await transaction.fuelLog.update({
      where: { id },
      data: { ...data, expenseId, deletedAt: null },
    });
  });

  revalidateOperationsPaths();
}

export async function restoreFuelLogAction(id: string) {
  await requireRecoveryAccess();
  const restoreResult = await runRestoreWithUserFeedback({
    id,
    entityType: "FuelLog",
    notFoundMessage: "Fuel purchase not found.",
    notDeletedMessage: "Fuel purchase is not deleted.",
    findRecord: (recordId) =>
      prisma.fuelLog.findUnique({
        where: { id: recordId },
        select: { id: true, vendor: true, totalCost: true, expenseId: true, deletedAt: true },
      }),
    restoreRecord: async (recordId) => {
      const fuelLog = await prisma.fuelLog.findUnique({ where: { id: recordId }, select: { expenseId: true } });
      return prisma.$transaction(async (transaction) => {
        await transaction.fuelLog.update({ where: { id: recordId }, data: { deletedAt: null } });
        if (fuelLog?.expenseId) {
          await transaction.expense.update({ where: { id: fuelLog.expenseId }, data: { deletedAt: null } });
        }
      });
    },
    createAuditLog,
    details: (fuelLog) => `Fuel purchase ${fuelLog.vendor ?? "Unknown vendor"} ${fuelLog.totalCost} restored.`,
  });

  if (restoreResult.status === "error" && restoreResult.message) {
    redirectRestoreError("Fuel purchase", restoreResult.message);
  }

  revalidateOperationsPaths();
  revalidateRecoveryPaths();
  redirectRestoreSuccess("Fuel purchase");
}

export async function deleteFuelLogAction(id: string) {
  await requireRecoveryAccess();
  const deletedAt = new Date();
  const fuelLog = await prisma.fuelLog.findUnique({ where: { id, deletedAt: null } });

  if (!fuelLog) {
    throw new Error("Fuel purchase not found.");
  }

  await prisma.$transaction(async (transaction) => {
    await transaction.fuelLog.update({ where: { id }, data: { deletedAt } });
    if (fuelLog.expenseId) {
      await transaction.expense.update({ where: { id: fuelLog.expenseId }, data: { deletedAt } });
    }
  });

  await createAuditLog({
    entityType: "FuelLog",
    entityId: fuelLog.id,
    details: `Fuel purchase ${fuelLog.vendor ?? "Unknown vendor"} ${fuelLog.totalCost} (deletedAt=${deletedAt.toISOString()})`,
  });

  revalidateOperationsPaths();
}

export async function createDocumentAlertAction(formData: FormData) {
  await requireWriteAccess();
  const title = formData.get("title") as string;
  const expiresDateStr = formData.get("expiresDate") as string;
  const notes = formData.get("notes") as string;
  const expiresDate = parseDateInput(expiresDateStr);

  const status = calculateDocumentAlertStatus(expiresDate);

  await prisma.documentAlert.create({ data: { title, expiresDate, status, notes: notes || null } });

  revalidatePath("/");
  revalidatePath("/documents");
  revalidatePath("/summary");
  revalidatePath("/profitability");
  revalidatePath("/assistant");
}

export async function updateDocumentAlertAction(id: string, formData: FormData) {
  await requireWriteAccess();
  const expiresDate = parseDateInput(String(formData.get("expiresDate") ?? ""));

  await prisma.documentAlert.update({
    where: { id },
    data: {
      title: String(formData.get("title") ?? "").trim(),
      expiresDate,
      status: calculateDocumentAlertStatus(expiresDate),
      notes: optionalString(formData.get("notes")),
    },
  });

  revalidateOperationsPaths();
}

export async function restoreDocumentAlertAction(id: string) {
  await requireRecoveryAccess();
  const restoreResult = await runRestoreWithUserFeedback({
    id,
    entityType: "DocumentAlert",
    notFoundMessage: "Document alert not found.",
    notDeletedMessage: "Document alert is not deleted.",
    findRecord: (recordId) =>
      prisma.documentAlert.findUnique({
        where: { id: recordId },
        select: { id: true, title: true, deletedAt: true },
      }),
    restoreRecord: (recordId) => prisma.documentAlert.update({ where: { id: recordId }, data: { deletedAt: null } }),
    createAuditLog,
    details: (alert) => `Document alert "${alert.title}" restored.`,
  });

  if (restoreResult.status === "error" && restoreResult.message) {
    redirectRestoreError("Document alert", restoreResult.message);
  }

  revalidateOperationsPaths();
  revalidateRecoveryPaths();
  redirectRestoreSuccess("Document alert");
}

export async function deleteDocumentAlertAction(id: string) {
  await requireRecoveryAccess();
  const deletedAt = new Date();
  const alert = await prisma.documentAlert.update({
    where: { id },
    data: { deletedAt },
  });
  await createAuditLog({
    entityType: "DocumentAlert",
    entityId: alert.id,
    details: `Document alert "${alert.title}" (deletedAt=${deletedAt.toISOString()})`,
  });

  revalidateOperationsPaths();
}

export async function createLoadOpportunity(formData: FormData) {
  await requireWriteAccess();
  const sourceType = formData.get("sourceType") as
    | "LOAD_BOARD"
    | "BROKER"
    | "CARRIER_NETWORK"
    | "DIRECT_SHIPPER"
    | "DISPATCH_REFERRAL"
    | "BACKHAUL"
    | "OTHER";
  const status = formData.get("status") as
    | "NEW"
    | "REVIEWING"
    | "CONTACTED"
    | "NEGOTIATING"
    | "BOOKED"
    | "REJECTED"
    | "EXPIRED";
  const priority = formData.get("priority") as "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  const rate = parseOptionalNumber(formData.get("rate"));
  const miles = parseOptionalNumber(formData.get("miles"));

  await prisma.loadOpportunity.create({
    data: {
      sourceType,
      sourceName: optionalString(formData.get("sourceName")),
      brokerName: optionalString(formData.get("brokerName")),
      shipperName: optionalString(formData.get("shipperName")),
      contactName: optionalString(formData.get("contactName")),
      phone: optionalString(formData.get("phone")),
      email: optionalString(formData.get("email")),
      origin: String(formData.get("origin") ?? "").trim(),
      destination: String(formData.get("destination") ?? "").trim(),
      pickupDate: parseDateInput(String(formData.get("pickupDate") ?? "")),
      deliveryDate: parseDateInput(String(formData.get("deliveryDate") ?? "")),
      equipmentType: optionalString(formData.get("equipmentType")),
      rate,
      miles,
      ratePerMile: calculateOpportunityRatePerMile(rate, miles),
      weight: parseOptionalNumber(formData.get("weight")),
      commodity: optionalString(formData.get("commodity")),
      status: status || "NEW",
      priority: priority || "MEDIUM",
      notes: optionalString(formData.get("notes")),
    },
  });

  revalidateLoadAcquisitionPaths();
}

export async function updateLoadOpportunity(id: string, formData: FormData) {
  await requireWriteAccess();
  const sourceType = formData.get("sourceType") as
    | "LOAD_BOARD"
    | "BROKER"
    | "CARRIER_NETWORK"
    | "DIRECT_SHIPPER"
    | "DISPATCH_REFERRAL"
    | "BACKHAUL"
    | "OTHER";
  const status = formData.get("status") as
    | "NEW"
    | "REVIEWING"
    | "CONTACTED"
    | "NEGOTIATING"
    | "BOOKED"
    | "REJECTED"
    | "EXPIRED";
  const priority = formData.get("priority") as "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  const rate = parseOptionalNumber(formData.get("rate"));
  const miles = parseOptionalNumber(formData.get("miles"));

  await prisma.loadOpportunity.update({
    where: { id },
    data: {
      sourceType,
      sourceName: optionalString(formData.get("sourceName")),
      brokerName: optionalString(formData.get("brokerName")),
      shipperName: optionalString(formData.get("shipperName")),
      contactName: optionalString(formData.get("contactName")),
      phone: optionalString(formData.get("phone")),
      email: optionalString(formData.get("email")),
      origin: String(formData.get("origin") ?? "").trim(),
      destination: String(formData.get("destination") ?? "").trim(),
      pickupDate: parseDateInput(String(formData.get("pickupDate") ?? "")),
      deliveryDate: parseDateInput(String(formData.get("deliveryDate") ?? "")),
      equipmentType: optionalString(formData.get("equipmentType")),
      rate,
      miles,
      ratePerMile: calculateOpportunityRatePerMile(rate, miles),
      weight: parseOptionalNumber(formData.get("weight")),
      commodity: optionalString(formData.get("commodity")),
      status: status || "NEW",
      priority: priority || "MEDIUM",
      notes: optionalString(formData.get("notes")),
    },
  });

  revalidateLoadAcquisitionPaths();
}

export async function restoreLoadOpportunity(id: string) {
  await requireRecoveryAccess();
  const restoreResult = await runRestoreWithUserFeedback({
    id,
    entityType: "LoadOpportunity",
    notFoundMessage: "Load opportunity not found.",
    notDeletedMessage: "Load opportunity is not deleted.",
    findRecord: (recordId) =>
      prisma.loadOpportunity.findUnique({
        where: { id: recordId },
        select: { id: true, origin: true, destination: true, deletedAt: true },
      }),
    restoreRecord: (recordId) => prisma.loadOpportunity.update({ where: { id: recordId }, data: { deletedAt: null } }),
    createAuditLog,
    details: (opportunity) => `Load opportunity ${opportunity.origin} to ${opportunity.destination} restored.`,
  });

  if (restoreResult.status === "error" && restoreResult.message) {
    redirectRestoreError("Load opportunity", restoreResult.message);
  }

  revalidateLoadAcquisitionPaths();
  revalidateRecoveryPaths();
  redirectRestoreSuccess("Load opportunity");
}

export async function updateLoadOpportunityStatus(
  id: string,
  status: "NEW" | "REVIEWING" | "CONTACTED" | "NEGOTIATING" | "BOOKED" | "REJECTED" | "EXPIRED",
) {
  await requireWriteAccess();
  await prisma.loadOpportunity.update({ where: { id, deletedAt: null }, data: { status } });

  revalidateLoadAcquisitionPaths();
}

export async function deleteLoadOpportunity(id: string) {
  await requireRecoveryAccess();
  const deletedAt = new Date();
  const opportunity = await prisma.loadOpportunity.update({
    where: { id },
    data: { deletedAt },
  });
  await createAuditLog({
    entityType: "LoadOpportunity",
    entityId: opportunity.id,
    details: `Load opportunity ${opportunity.origin} to ${opportunity.destination} (${opportunity.sourceType}) (deletedAt=${deletedAt.toISOString()})`,
  });

  revalidateLoadAcquisitionPaths();
}

export async function restoreMarketSignal(id: string) {
  await requireRecoveryAccess();
  const restoreResult = await runRestoreWithUserFeedback({
    id,
    entityType: "MarketSignal",
    notFoundMessage: "Market signal not found.",
    notDeletedMessage: "Market signal is not deleted.",
    findRecord: (recordId) =>
      prisma.marketSignal.findUnique({
        where: { id: recordId },
        select: { id: true, marketName: true, deletedAt: true },
      }),
    restoreRecord: (recordId) => prisma.marketSignal.update({ where: { id: recordId }, data: { deletedAt: null } }),
    createAuditLog,
    details: (signal) => `Market signal ${signal.marketName} restored.`,
  });

  if (restoreResult.status === "error" && restoreResult.message) {
    redirectRestoreError("Market signal", restoreResult.message);
  }

  revalidateLoadAcquisitionPaths();
  revalidateRecoveryPaths();
  redirectRestoreSuccess("Market signal");
}

export async function createMarketSignal(formData: FormData) {
  await requireWriteAccess();
  const demandLevel = formData.get("demandLevel") as "LOW" | "MEDIUM" | "HIGH" | "HOT";
  const sourceType = formData.get("sourceType") as
    | "BROKER"
    | "LOAD_BOARD"
    | "CARRIER"
    | "SHIPPER"
    | "PERSONAL_OBSERVATION"
    | "OTHER";

  await prisma.marketSignal.create({
    data: {
      marketName: String(formData.get("marketName") ?? "").trim(),
      originRegion: optionalString(formData.get("originRegion")),
      destinationRegion: optionalString(formData.get("destinationRegion")),
      equipmentType: optionalString(formData.get("equipmentType")),
      demandLevel: demandLevel || "MEDIUM",
      sourceType,
      sourceName: optionalString(formData.get("sourceName")),
      notes: optionalString(formData.get("notes")),
    },
  });

  revalidateLoadAcquisitionPaths();
}

export async function updateMarketSignal(id: string, formData: FormData) {
  await requireWriteAccess();
  const demandLevel = formData.get("demandLevel") as "LOW" | "MEDIUM" | "HIGH" | "HOT";
  const sourceType = formData.get("sourceType") as
    | "BROKER"
    | "LOAD_BOARD"
    | "CARRIER"
    | "SHIPPER"
    | "PERSONAL_OBSERVATION"
    | "OTHER";

  await prisma.marketSignal.update({
    where: { id },
    data: {
      marketName: String(formData.get("marketName") ?? "").trim(),
      originRegion: optionalString(formData.get("originRegion")),
      destinationRegion: optionalString(formData.get("destinationRegion")),
      equipmentType: optionalString(formData.get("equipmentType")),
      demandLevel: demandLevel || "MEDIUM",
      sourceType,
      sourceName: optionalString(formData.get("sourceName")),
      notes: optionalString(formData.get("notes")),
    },
  });

  revalidateLoadAcquisitionPaths();
}

export async function deleteMarketSignal(id: string) {
  await requireRecoveryAccess();
  const deletedAt = new Date();
  const signal = await prisma.marketSignal.update({
    where: { id },
    data: { deletedAt },
  });
  await createAuditLog({
    entityType: "MarketSignal",
    entityId: signal.id,
    details: `Market signal ${signal.marketName} (${signal.sourceType}) (deletedAt=${deletedAt.toISOString()})`,
  });

  revalidateLoadAcquisitionPaths();
}

export async function restoreBrokerContact(id: string) {
  await requireRecoveryAccess();
  const restoreResult = await runRestoreWithUserFeedback({
    id,
    entityType: "BrokerContact",
    notFoundMessage: "Broker contact not found.",
    notDeletedMessage: "Broker contact is not deleted.",
    findRecord: (recordId) =>
      prisma.brokerContact.findUnique({
        where: { id: recordId },
        select: { id: true, companyName: true, deletedAt: true },
      }),
    restoreRecord: (recordId) => prisma.brokerContact.update({ where: { id: recordId }, data: { deletedAt: null } }),
    createAuditLog,
    details: (broker) => `Broker ${broker.companyName} restored.`,
  });

  if (restoreResult.status === "error" && restoreResult.message) {
    redirectRestoreError("Broker contact", restoreResult.message);
  }

  revalidateLoadAcquisitionPaths();
  revalidateRecoveryPaths();
  redirectRestoreSuccess("Broker contact");
}

export async function createBrokerContact(formData: FormData) {
  await requireWriteAccess();
  const relationshipStatus = formData.get("relationshipStatus") as
    | "NEW"
    | "ACTIVE"
    | "PREFERRED"
    | "WATCHLIST"
    | "DO_NOT_USE";

  await prisma.brokerContact.create({
    data: {
      companyName: String(formData.get("companyName") ?? "").trim(),
      contactName: optionalString(formData.get("contactName")),
      phone: optionalString(formData.get("phone")),
      email: optionalString(formData.get("email")),
      preferredLanes: optionalString(formData.get("preferredLanes")),
      equipmentNeeds: optionalString(formData.get("equipmentNeeds")),
      paymentNotes: optionalString(formData.get("paymentNotes")),
      relationshipStatus: relationshipStatus || "NEW",
      notes: optionalString(formData.get("notes")),
    },
  });

  revalidateLoadAcquisitionPaths();
}

export async function updateBrokerContact(id: string, formData: FormData) {
  await requireWriteAccess();
  const relationshipStatus = formData.get("relationshipStatus") as
    | "NEW"
    | "ACTIVE"
    | "PREFERRED"
    | "WATCHLIST"
    | "DO_NOT_USE";

  await prisma.brokerContact.update({
    where: { id },
    data: {
      companyName: String(formData.get("companyName") ?? "").trim(),
      contactName: optionalString(formData.get("contactName")),
      phone: optionalString(formData.get("phone")),
      email: optionalString(formData.get("email")),
      preferredLanes: optionalString(formData.get("preferredLanes")),
      equipmentNeeds: optionalString(formData.get("equipmentNeeds")),
      paymentNotes: optionalString(formData.get("paymentNotes")),
      relationshipStatus: relationshipStatus || "NEW",
      notes: optionalString(formData.get("notes")),
    },
  });

  revalidateLoadAcquisitionPaths();
}

export async function updateBrokerContactStatus(
  id: string,
  relationshipStatus: "NEW" | "ACTIVE" | "PREFERRED" | "WATCHLIST" | "DO_NOT_USE",
) {
  await requireWriteAccess();
  await prisma.brokerContact.update({ where: { id, deletedAt: null }, data: { relationshipStatus } });

  revalidateLoadAcquisitionPaths();
}

export async function deleteBrokerContact(id: string) {
  await requireRecoveryAccess();
  const deletedAt = new Date();
  const broker = await prisma.brokerContact.update({
    where: { id },
    data: { deletedAt },
  });
  await createAuditLog({
    entityType: "BrokerContact",
    entityId: broker.id,
    details: `Broker ${broker.companyName} (deletedAt=${deletedAt.toISOString()})`,
  });

  revalidateLoadAcquisitionPaths();
}

export async function restoreShipperLead(id: string) {
  await requireRecoveryAccess();
  const restoreResult = await runRestoreWithUserFeedback({
    id,
    entityType: "ShipperLead",
    notFoundMessage: "Shipper lead not found.",
    notDeletedMessage: "Shipper lead is not deleted.",
    findRecord: (recordId) =>
      prisma.shipperLead.findUnique({
        where: { id: recordId },
        select: { id: true, companyName: true, deletedAt: true },
      }),
    restoreRecord: (recordId) => prisma.shipperLead.update({ where: { id: recordId }, data: { deletedAt: null } }),
    createAuditLog,
    details: (shipper) => `Shipper lead ${shipper.companyName} restored.`,
  });

  if (restoreResult.status === "error" && restoreResult.message) {
    redirectRestoreError("Shipper lead", restoreResult.message);
  }

  revalidateLoadAcquisitionPaths();
  revalidateRecoveryPaths();
  redirectRestoreSuccess("Shipper lead");
}

export async function createShipperLead(formData: FormData) {
  await requireWriteAccess();
  const status = formData.get("status") as "LEAD" | "CONTACTED" | "QUALIFIED" | "PROPOSAL_SENT" | "ACTIVE" | "LOST";

  await prisma.shipperLead.create({
    data: {
      companyName: String(formData.get("companyName") ?? "").trim(),
      industry: optionalString(formData.get("industry")),
      contactName: optionalString(formData.get("contactName")),
      phone: optionalString(formData.get("phone")),
      email: optionalString(formData.get("email")),
      location: optionalString(formData.get("location")),
      recurringLanes: optionalString(formData.get("recurringLanes")),
      freightType: optionalString(formData.get("freightType")),
      status: status || "LEAD",
      notes: optionalString(formData.get("notes")),
    },
  });

  revalidateLoadAcquisitionPaths();
}

export async function updateShipperLead(id: string, formData: FormData) {
  await requireWriteAccess();
  const status = formData.get("status") as "LEAD" | "CONTACTED" | "QUALIFIED" | "PROPOSAL_SENT" | "ACTIVE" | "LOST";

  await prisma.shipperLead.update({
    where: { id },
    data: {
      companyName: String(formData.get("companyName") ?? "").trim(),
      industry: optionalString(formData.get("industry")),
      contactName: optionalString(formData.get("contactName")),
      phone: optionalString(formData.get("phone")),
      email: optionalString(formData.get("email")),
      location: optionalString(formData.get("location")),
      recurringLanes: optionalString(formData.get("recurringLanes")),
      freightType: optionalString(formData.get("freightType")),
      status: status || "LEAD",
      notes: optionalString(formData.get("notes")),
    },
  });

  revalidateLoadAcquisitionPaths();
}

export async function updateShipperLeadStatus(
  id: string,
  status: "LEAD" | "CONTACTED" | "QUALIFIED" | "PROPOSAL_SENT" | "ACTIVE" | "LOST",
) {
  await requireWriteAccess();
  await prisma.shipperLead.update({ where: { id, deletedAt: null }, data: { status } });

  revalidateLoadAcquisitionPaths();
}

export async function deleteShipperLead(id: string) {
  await requireRecoveryAccess();
  const deletedAt = new Date();
  const shipper = await prisma.shipperLead.update({
    where: { id },
    data: { deletedAt },
  });
  await createAuditLog({
    entityType: "ShipperLead",
    entityId: shipper.id,
    details: `Shipper lead ${shipper.companyName} (deletedAt=${deletedAt.toISOString()})`,
  });

  revalidateLoadAcquisitionPaths();
}

export async function restoreSmartFuelStop(id: string) {
  await requireRecoveryAccess();
  const restoreResult = await runRestoreWithUserFeedback({
    id,
    entityType: "SmartFuelStop",
    notFoundMessage: "Smart fuel stop not found.",
    notDeletedMessage: "Smart fuel stop is not deleted.",
    findRecord: (recordId) =>
      prisma.smartFuelStop.findUnique({
        where: { id: recordId },
        select: { id: true, truckStopName: true, deletedAt: true },
      }),
    restoreRecord: (recordId) => prisma.smartFuelStop.update({ where: { id: recordId }, data: { deletedAt: null } }),
    createAuditLog,
    details: (fuelStop) => `Smart fuel stop ${fuelStop.truckStopName} restored.`,
  });

  if (restoreResult.status === "error" && restoreResult.message) {
    redirectRestoreError("Smart fuel stop", restoreResult.message);
  }

  revalidateLoadAcquisitionPaths();
  revalidateRecoveryPaths();
  redirectRestoreSuccess("Smart fuel stop");
}

export async function createSmartFuelStop(formData: FormData) {
  await requireWriteAccess();
  const fuelPrice = parseOptionalNumber(formData.get("fuelPrice"));
  const gallonsPlanned = parseOptionalNumber(formData.get("gallonsPlanned"));

  await prisma.smartFuelStop.create({
    data: {
      truckStopName: String(formData.get("truckStopName") ?? "").trim(),
      location: String(formData.get("location") ?? "").trim(),
      state: optionalString(formData.get("state")),
      fuelPrice,
      routeName: optionalString(formData.get("routeName")),
      gallonsPlanned,
      estimatedCost: calculateFuelEstimatedCost(fuelPrice, gallonsPlanned),
      iftaNote: optionalString(formData.get("iftaNote")),
      preferred: formData.get("preferred") === "on",
      notes: optionalString(formData.get("notes")),
    },
  });

  revalidateLoadAcquisitionPaths();
}

export async function updateSmartFuelStop(id: string, formData: FormData) {
  await requireWriteAccess();
  const fuelPrice = parseOptionalNumber(formData.get("fuelPrice"));
  const gallonsPlanned = parseOptionalNumber(formData.get("gallonsPlanned"));

  await prisma.smartFuelStop.update({
    where: { id },
    data: {
      truckStopName: String(formData.get("truckStopName") ?? "").trim(),
      location: String(formData.get("location") ?? "").trim(),
      state: optionalString(formData.get("state")),
      fuelPrice,
      routeName: optionalString(formData.get("routeName")),
      gallonsPlanned,
      estimatedCost: calculateFuelEstimatedCost(fuelPrice, gallonsPlanned),
      iftaNote: optionalString(formData.get("iftaNote")),
      preferred: formData.get("preferred") === "on",
      notes: optionalString(formData.get("notes")),
    },
  });

  revalidateLoadAcquisitionPaths();
}

export async function togglePreferredFuelStop(id: string) {
  await requireWriteAccess();
  const fuelStop = await prisma.smartFuelStop.findUnique({ where: { id, deletedAt: null }, select: { preferred: true } });
  if (!fuelStop) {
    throw new Error("Fuel stop not found.");
  }

  await prisma.smartFuelStop.update({ where: { id, deletedAt: null }, data: { preferred: !fuelStop.preferred } });

  revalidateLoadAcquisitionPaths();
}

export async function deleteSmartFuelStop(id: string) {
  await requireRecoveryAccess();
  const deletedAt = new Date();
  const fuelStop = await prisma.smartFuelStop.update({
    where: { id },
    data: { deletedAt },
  });
  await createAuditLog({
    entityType: "SmartFuelStop",
    entityId: fuelStop.id,
    details: `Smart fuel stop ${fuelStop.truckStopName} in ${fuelStop.location} (deletedAt=${deletedAt.toISOString()})`,
  });

  revalidateLoadAcquisitionPaths();
}

export async function restoreMaintenanceItemAction(id: string) {
  await requireRecoveryAccess();
  const restoreResult = await runRestoreWithUserFeedback({
    id,
    entityType: "MaintenanceItem",
    notFoundMessage: "Maintenance item not found.",
    notDeletedMessage: "Maintenance item is not deleted.",
    findRecord: (recordId) =>
      prisma.maintenanceItem.findUnique({
        where: { id: recordId },
        select: { id: true, title: true, deletedAt: true },
      }),
    restoreRecord: (recordId) => prisma.maintenanceItem.update({ where: { id: recordId }, data: { deletedAt: null } }),
    createAuditLog,
    details: (item) => `Maintenance item ${item.title} restored.`,
  });

  if (restoreResult.status === "error" && restoreResult.message) {
    redirectRestoreError("Maintenance item", restoreResult.message);
  }

  revalidateOperationsPaths();
  revalidateRecoveryPaths();
  redirectRestoreSuccess("Maintenance item");
}

export async function createMaintenanceItemAction(formData: FormData) {
  await requireWriteAccess();
  const title = formData.get("title") as string;
  const dueDateStr = formData.get("dueDate") as string;
  const dueMileageStr = formData.get("dueMileage") as string;
  const currentMileageStr = formData.get("currentMileage") as string;
  const notes = formData.get("notes") as string;
  const dueDate = parseDateInput(dueDateStr);
  const dueMileage = dueMileageStr ? parseFloat(dueMileageStr) : null;
  const currentMileage = currentMileageStr ? parseFloat(currentMileageStr) : null;

  await prisma.maintenanceItem.create({
    data: {
      title,
      dueDate,
      dueMileage,
      currentMileage,
      status: calculateMaintenanceStatus({ dueDate, dueMileage, currentMileage }),
      notes: notes || null,
    },
  });

  revalidatePath("/maintenance");
  revalidatePath("/");
  revalidatePath("/summary");
  revalidatePath("/profitability");
  revalidatePath("/assistant");
}

export async function updateMaintenanceItemAction(id: string, formData: FormData) {
  await requireWriteAccess();
  const dueDate = parseDateInput(String(formData.get("dueDate") ?? ""));
  const lastServiceDate = parseDateInput(String(formData.get("lastServiceDate") ?? ""));
  const dueMileage = parseOptionalNumber(formData.get("dueMileage"));
  const currentMileage = parseOptionalNumber(formData.get("currentMileage"));
  const status = formData.get("status") as "UPCOMING" | "DUE_SOON" | "OVERDUE" | "COMPLETED";

  await prisma.maintenanceItem.update({
    where: { id },
    data: {
      title: String(formData.get("title") ?? "").trim(),
      dueDate,
      dueMileage,
      lastServiceDate,
      lastServiceMileage: parseOptionalNumber(formData.get("lastServiceMileage")),
      currentMileage,
      status: status === "COMPLETED" ? "COMPLETED" : calculateMaintenanceStatus({ dueDate, dueMileage, currentMileage }),
      notes: optionalString(formData.get("notes")),
    },
  });

  revalidateOperationsPaths();
}

export async function completeMaintenanceAction(id: string) {
  await requireWriteAccess();
  await prisma.maintenanceItem.update({
    where: { id, deletedAt: null },
    data: { status: "COMPLETED", lastServiceDate: new Date() },
  });

  revalidatePath("/maintenance");
  revalidatePath("/");
  revalidatePath("/summary");
  revalidatePath("/profitability");
  revalidatePath("/assistant");
}

export async function deleteMaintenanceItemAction(id: string) {
  await requireRecoveryAccess();
  const deletedAt = new Date();
  const item = await prisma.maintenanceItem.update({
    where: { id },
    data: { deletedAt },
  });
  await createAuditLog({
    entityType: "MaintenanceItem",
    entityId: item.id,
    details: `Maintenance item ${item.title} (deletedAt=${deletedAt.toISOString()})`,
  });

  revalidateOperationsPaths();
}

export async function createInspectionAction(formData: FormData) {
  await requireWriteAccess();
  const type = formData.get("type") as "PRE_TRIP" | "POST_TRIP";
  const odometer = formData.get("odometer") as string;
  const notes = formData.get("notes") as string;
  const parsedOdometer = odometer ? parseFloat(odometer) : null;
  const failedItems = new Set(formData.getAll("failedItem").map(String));

  await prisma.inspectionChecklist.create({
    data: {
      type,
      odometer: parsedOdometer,
      overallPassed: failedItems.size === 0,
      notes: notes || null,
      items: {
        create: DOT_INSPECTION_ITEMS.map((item) => ({
          ...item,
          passed: !failedItems.has(`${item.category}:${item.item}`),
        })),
      },
    },
  });

  if (parsedOdometer !== null) {
    await applyCurrentMileageToOpenMaintenance(parsedOdometer);
  }

  revalidatePath("/");
  revalidatePath("/inspections");
  revalidatePath("/maintenance");
  revalidatePath("/assistant");
}

export async function updateInspectionAction(id: string, formData: FormData) {
  await requireWriteAccess();
  const type = formData.get("type") as "PRE_TRIP" | "POST_TRIP";
  const inspectionDate = parseDateInput(String(formData.get("inspectionDate") ?? ""));
  const parsedOdometer = parseOptionalNumber(formData.get("odometer"));
  const failedItems = new Set(formData.getAll("failedItem").map(String));

  if (!inspectionDate) {
    throw new Error("Inspection date is required.");
  }

  await prisma.$transaction(async (transaction) => {
    await transaction.inspectionChecklist.update({
      where: { id, deletedAt: null },
      data: {
        inspectionDate,
        type,
        odometer: parsedOdometer,
        overallPassed: failedItems.size === 0,
        notes: optionalString(formData.get("notes")),
      },
    });

    await transaction.inspectionItem.deleteMany({ where: { checklistId: id } });
    await transaction.inspectionItem.createMany({
      data: DOT_INSPECTION_ITEMS.map((item) => ({
        checklistId: id,
        ...item,
        passed: !failedItems.has(`${item.category}:${item.item}`),
      })),
    });
  });

  if (parsedOdometer !== null) {
    await applyCurrentMileageToOpenMaintenance(parsedOdometer);
  }

  revalidateOperationsPaths();
}

export async function restoreInspectionAction(id: string) {
  await requireRecoveryAccess();
  const restoreResult = await runRestoreWithUserFeedback({
    id,
    entityType: "InspectionChecklist",
    notFoundMessage: "Inspection checklist not found.",
    notDeletedMessage: "Inspection checklist is not deleted.",
    findRecord: (recordId) =>
      prisma.inspectionChecklist.findUnique({
        where: { id: recordId },
        select: { id: true, type: true, deletedAt: true },
      }),
    restoreRecord: (recordId) =>
      prisma.inspectionChecklist.update({ where: { id: recordId }, data: { deletedAt: null } }),
    createAuditLog,
    details: (inspection) => `Inspection ${inspection.type} restored.`,
  });

  if (restoreResult.status === "error" && restoreResult.message) {
    redirectRestoreError("Inspection checklist", restoreResult.message);
  }

  revalidateOperationsPaths();
  revalidateRecoveryPaths();
  redirectRestoreSuccess("Inspection checklist");
}

export async function deleteInspectionAction(id: string) {
  await requireRecoveryAccess();
  const deletedAt = new Date();
  const inspection = await prisma.inspectionChecklist.update({
    where: { id },
    data: { deletedAt },
  });
  await createAuditLog({
    entityType: "InspectionChecklist",
    entityId: inspection.id,
    details: `Inspection ${inspection.type} (${new Date(inspection.inspectionDate).toISOString()}) (deletedAt=${deletedAt.toISOString()})`,
  });

  revalidateOperationsPaths();
}
