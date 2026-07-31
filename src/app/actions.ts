"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAuthentication, signIn, signOut } from "@/lib/auth";
import { DOT_INSPECTION_ITEMS } from "@/lib/inspections";
import { applyCurrentMileageToOpenMaintenance, calculateMaintenanceStatus } from "@/lib/maintenance";
import { prisma } from "@/lib/prisma";

function parseDateInput(value: string) {
  if (!value) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) {
    return new Date(value);
  }

  return new Date(year, month - 1, day, 12);
}

export async function createLoadAction(formData: FormData) {
  await requireAuthentication();

  const origin = formData.get("origin") as string;
  const destination = formData.get("destination") as string;
  const broker = formData.get("broker") as string;
  const commodity = formData.get("commodity") as string;
  const rateStr = formData.get("rate") as string;
  const milesStr = formData.get("miles") as string;
  const rate = rateStr ? parseFloat(rateStr) : null;
  const miles = milesStr ? parseFloat(milesStr) : null;
  const ratePerMile = rate && miles ? rate / miles : null;

  await prisma.load.create({
    data: { origin, destination, broker: broker || null, commodity: commodity || null, rate, miles, ratePerMile },
  });

  revalidatePath("/");
  revalidatePath("/loads");
  revalidatePath("/summary");
  revalidatePath("/profitability");
  revalidatePath("/assistant");
}

export async function updateLoadStatusAction(id: string, status: "BOOKED" | "IN_TRANSIT" | "DELIVERED" | "CANCELLED") {
  await requireAuthentication();

  await prisma.load.update({ where: { id }, data: { status } });

  revalidatePath("/");
  revalidatePath("/loads");
  revalidatePath("/summary");
  revalidatePath("/profitability");
  revalidatePath("/assistant");
}

export async function createExpenseAction(formData: FormData) {
  await requireAuthentication();

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
  const notes = formData.get("notes") as string;
  const loadId = formData.get("loadId") as string;

  if (!expenseDate) {
    throw new Error("Expense date is required.");
  }

  await prisma.expense.create({
    data: { category, amount, expenseDate, vendor: vendor || null, notes: notes || null, loadId: loadId || null },
  });

  revalidatePath("/");
  revalidatePath("/expenses");
  revalidatePath("/summary");
  revalidatePath("/profitability");
  revalidatePath("/assistant");
}

export async function createDocumentAlertAction(formData: FormData) {
  await requireAuthentication();

  const title = formData.get("title") as string;
  const expiresDateStr = formData.get("expiresDate") as string;
  const notes = formData.get("notes") as string;
  const expiresDate = parseDateInput(expiresDateStr);

  let status: "CURRENT" | "EXPIRING_SOON" | "EXPIRED" | "MISSING" = "CURRENT";
  if (expiresDate) {
    const daysOut = (expiresDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    if (daysOut < 0) {
      status = "EXPIRED";
    } else if (daysOut < 60) {
      status = "EXPIRING_SOON";
    }
  } else {
    status = "MISSING";
  }

  await prisma.documentAlert.create({ data: { title, expiresDate, status, notes: notes || null } });

  revalidatePath("/");
  revalidatePath("/documents");
  revalidatePath("/assistant");
}

export async function createMaintenanceItemAction(formData: FormData) {
  await requireAuthentication();

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
  revalidatePath("/assistant");
}

export async function completeMaintenanceAction(id: string) {
  await requireAuthentication();

  await prisma.maintenanceItem.update({
    where: { id },
    data: { status: "COMPLETED", lastServiceDate: new Date() },
  });

  revalidatePath("/maintenance");
  revalidatePath("/assistant");
}

export async function createInspectionAction(formData: FormData) {
  await requireAuthentication();

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

function getSafeRedirectTarget(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }

  return value;
}

export async function loginAction(formData: FormData) {
  const password = (formData.get("password") as string | null)?.trim() ?? "";
  const nextPath = getSafeRedirectTarget(formData.get("next"));
  const result = await signIn(password);

  if (!result.ok) {
    const destination = new URL("/login", "http://localhost");
    destination.searchParams.set("error", result.reason === "config" ? "config" : "invalid");
    if (nextPath !== "/") {
      destination.searchParams.set("next", nextPath);
    }

    redirect(`${destination.pathname}${destination.search}`);
  }

  redirect(nextPath);
}

export async function logoutAction() {
  await signOut();
  redirect("/login");
}
