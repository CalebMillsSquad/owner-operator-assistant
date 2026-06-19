"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

export async function createLoadAction(formData: FormData) {
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

  revalidatePath("/loads");
  revalidatePath("/");
  revalidatePath("/summary");
}

export async function updateLoadStatusAction(id: string, status: "BOOKED" | "IN_TRANSIT" | "DELIVERED" | "CANCELLED") {
  await prisma.load.update({ where: { id }, data: { status } });
  revalidatePath("/loads");
  revalidatePath("/");
  revalidatePath("/summary");
}

export async function createExpenseAction(formData: FormData) {
  const category = formData.get("category") as "FUEL" | "OIL" | "TIRES" | "REPAIRS" | "TOLLS" | "SCALES" | "PERMITS" | "INSURANCE" | "FOOD" | "OTHER";
  const amount = parseFloat(formData.get("amount") as string);
  const expenseDate = new Date(formData.get("expenseDate") as string);
  const vendor = formData.get("vendor") as string;
  const notes = formData.get("notes") as string;
  const loadId = formData.get("loadId") as string;

  await prisma.expense.create({
    data: { category, amount, expenseDate, vendor: vendor || null, notes: notes || null, loadId: loadId || null },
  });

  revalidatePath("/expenses");
  revalidatePath("/summary");
  revalidatePath("/");
}

export async function createDocumentAlertAction(formData: FormData) {
  const title = formData.get("title") as string;
  const expiresDateStr = formData.get("expiresDate") as string;
  const notes = formData.get("notes") as string;
  const expiresDate = expiresDateStr ? new Date(expiresDateStr) : null;

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
  revalidatePath("/documents");
  revalidatePath("/");
}
