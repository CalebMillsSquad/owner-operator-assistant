"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { assessCompatibility } from "@/lib/freight-intelligence";
import { requireOperatorRole } from "@/lib/auth";

const text = (form: FormData, key: string) => {
  const value = form.get(key);
  return typeof value === "string" && value.trim() ? value.trim() : null;
};
const requiredText = (form: FormData, key: string) => {
  const value = text(form, key);
  if (!value) throw new Error(`${key} is required.`);
  return value;
};
const num = (form: FormData, key: string) => {
  const value = text(form, key);
  if (!value) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) throw new Error(`${key} must be a non-negative number.`);
  return parsed;
};
const date = (form: FormData, key: string) => {
  const value = text(form, key);
  return value ? new Date(`${value}T12:00:00`) : null;
};

export async function createEquipmentProfile(form: FormData) {
  await requireOperatorRole("TESTER");
  await prisma.equipmentProfile.create({ data: {
    name: text(form, "name") ?? "Primary equipment", equipmentType: (text(form, "equipmentType") ?? "OTHER") as never,
    vehicleYear: num(form, "vehicleYear"), vehicleMake: text(form, "vehicleMake"), vehicleModel: text(form, "vehicleModel"), unitNumber: text(form, "unitNumber"),
    cargoLengthFeet: num(form, "cargoLengthFeet"), cargoWidthInches: num(form, "cargoWidthInches"), cargoHeightInches: num(form, "cargoHeightInches"),
    doorWidthInches: num(form, "doorWidthInches"), doorHeightInches: num(form, "doorHeightInches"), palletCapacity: num(form, "palletCapacity"),
    maximumPayloadPounds: num(form, "maximumPayloadPounds"), estimatedMpg: num(form, "estimatedMpg"), maintenancePerMile: num(form, "maintenancePerMile"),
    insurancePerWeek: num(form, "insurancePerWeek"), paymentPerWeek: num(form, "paymentPerWeek"), defaultDispatchPercent: num(form, "defaultDispatchPercent"),
    minimumEffectiveRpm: num(form, "minimumEffectiveRpm"), minimumProjectedProfit: num(form, "minimumProjectedProfit"), notes: text(form, "notes"),
  }});
  revalidatePath("/freight-intelligence"); revalidatePath("/freight-intelligence/equipment");
  redirect("/freight-intelligence/equipment");
}

export async function updateEquipmentProfile(id: string, form: FormData) {
  await requireOperatorRole("TESTER");
  await prisma.equipmentProfile.update({ where: { id }, data: {
    name: text(form, "name") ?? "Primary equipment", equipmentType: (text(form, "equipmentType") ?? "OTHER") as never,
    vehicleYear: num(form, "vehicleYear"), vehicleMake: text(form, "vehicleMake"), vehicleModel: text(form, "vehicleModel"), unitNumber: text(form, "unitNumber"),
    cargoLengthFeet: num(form, "cargoLengthFeet"), cargoWidthInches: num(form, "cargoWidthInches"), cargoHeightInches: num(form, "cargoHeightInches"),
    doorWidthInches: num(form, "doorWidthInches"), doorHeightInches: num(form, "doorHeightInches"), palletCapacity: num(form, "palletCapacity"),
    maximumPayloadPounds: num(form, "maximumPayloadPounds"), estimatedMpg: num(form, "estimatedMpg"), maintenancePerMile: num(form, "maintenancePerMile"),
    insurancePerWeek: num(form, "insurancePerWeek"), paymentPerWeek: num(form, "paymentPerWeek"), defaultDispatchPercent: num(form, "defaultDispatchPercent"),
    minimumEffectiveRpm: num(form, "minimumEffectiveRpm"), minimumProjectedProfit: num(form, "minimumProjectedProfit"), notes: text(form, "notes"),
  }});
  revalidatePath("/freight-intelligence"); revalidatePath("/freight-intelligence/equipment");
  redirect("/freight-intelligence/equipment");
}

export async function createFreightOpportunity(form: FormData) {
  await requireOperatorRole("TESTER");
  const equipmentProfileId = text(form, "equipmentProfileId");
  const equipment = equipmentProfileId ? await prisma.equipmentProfile.findUnique({ where: { id: equipmentProfileId } }) : null;
  const loadedMiles = num(form, "loadedMiles");
  const deadheadMiles = num(form, "deadheadMiles");
  const repositionMiles = num(form, "repositionMiles");
  const weightPounds = num(form, "weightPounds");
  const palletCount = num(form, "palletCount");
  const compatibility = assessCompatibility({ requiredEquipmentType: text(form, "requiredEquipmentType"), weightPounds, requiredLengthFeet: num(form, "requiredLengthFeet"), palletCount }, equipment);
  const record = await prisma.freightOpportunity.create({ data: {
    source: text(form, "source"), externalReference: text(form, "externalReference"), capturedAt: date(form, "capturedAt") ?? new Date(), originCity: requiredText(form, "originCity"), originState: requiredText(form, "originState"), originZip: text(form, "originZip"),
    destinationCity: requiredText(form, "destinationCity"), destinationState: requiredText(form, "destinationState"), destinationZip: text(form, "destinationZip"), loadedMiles, deadheadMiles, repositionMiles,
    stopCount: num(form, "stopCount") ?? 1, pickupDate: date(form, "pickupDate"), deliveryDate: date(form, "deliveryDate"), pickupWindow: text(form, "pickupWindow"), deliveryWindow: text(form, "deliveryWindow"),
    commodity: text(form, "commodity"), weightPounds, palletCount, requiredLengthFeet: num(form, "requiredLengthFeet"), requiredEquipmentType: (text(form, "requiredEquipmentType") as never) ?? null,
    offeredRate: num(form, "offeredRate"), openingAsk: num(form, "openingAsk"), targetRate: num(form, "targetRate"), walkAwayRate: num(form, "walkAwayRate"), estimatedFuelPrice: num(form, "estimatedFuelPrice"), estimatedTolls: num(form, "estimatedTolls"), estimatedOtherExpenses: num(form, "estimatedOtherExpenses"), dispatchPercent: num(form, "dispatchPercent"), maintenancePerMile: num(form, "maintenancePerMile"),
    brokerName: text(form, "brokerName"), brokerMcNumber: text(form, "brokerMcNumber"), brokerContactName: text(form, "brokerContactName"), brokerPhone: text(form, "brokerPhone"), brokerEmail: text(form, "brokerEmail"), brokerVerified: form.get("brokerVerified") === "on", notes: text(form, "notes"), equipmentProfileId,
    compatibilityStatus: compatibility.status, compatibilityReasons: JSON.stringify(compatibility.reasons),
  }});
  revalidatePath("/freight-intelligence"); revalidatePath("/freight-intelligence/opportunities");
  redirect(`/freight-intelligence/opportunities/${record.id}`);
}

export async function updateFreightStatus(id: string, status: "REVIEWING" | "QUALIFIED" | "NEGOTIATING" | "ACCEPTED" | "REJECTED" | "EXPIRED") {
  await requireOperatorRole("TESTER");
  await prisma.freightOpportunity.update({ where: { id }, data: { decisionStatus: status } });
  revalidatePath(`/freight-intelligence/opportunities/${id}`); revalidatePath("/freight-intelligence");
}

export async function addFreightNegotiation(id: string, form: FormData) {
  await requireOperatorRole("TESTER");
  const amount = num(form, "amount");
  await prisma.$transaction(async (tx) => {
    await tx.freightNegotiation.create({ data: { opportunityId: id, negotiationType: (text(form, "negotiationType") ?? "NOTE") as never, amount, message: text(form, "message"), contactName: text(form, "contactName") } });
    if (amount != null && ["BROKER_OFFER", "BROKER_COUNTER", "DISPATCHER_COUNTER", "FINAL_AGREEMENT"].includes(text(form, "negotiationType") ?? "")) await tx.freightOpportunity.update({ where: { id }, data: { decisionStatus: "NEGOTIATING", offeredRate: (text(form, "negotiationType") ?? "").startsWith("BROKER") ? amount : undefined, finalNegotiatedRate: text(form, "negotiationType") === "FINAL_AGREEMENT" ? amount : undefined } });
  });
  revalidatePath(`/freight-intelligence/opportunities/${id}`); revalidatePath("/freight-intelligence/negotiations");
}

export async function convertFreightOpportunity(id: string, confirmWarnings = false) {
  await requireOperatorRole("TESTER");
  const opportunity = await prisma.freightOpportunity.findUnique({ where: { id }, include: { equipmentProfile: true } });
  if (!opportunity) throw new Error("Opportunity not found.");
  if (opportunity.convertedLoadId) redirect(`/loads/${opportunity.convertedLoadId}`);
  const rate = opportunity.finalNegotiatedRate ?? opportunity.offeredRate;
  if (rate == null || (opportunity.decisionStatus !== "ACCEPTED" && opportunity.finalNegotiatedRate == null)) throw new Error("Accept the opportunity or record a final negotiated rate before conversion.");
  if (opportunity.compatibilityStatus === "INCOMPATIBLE") throw new Error("This opportunity is incompatible with the selected equipment.");
  if (opportunity.compatibilityStatus === "REVIEW_REQUIRED" && !confirmWarnings) throw new Error("Confirm unresolved equipment warnings before conversion.");
  const load = await prisma.$transaction(async (tx) => {
    const created = await tx.load.create({ data: { origin: `${opportunity.originCity}, ${opportunity.originState}`, destination: `${opportunity.destinationCity}, ${opportunity.destinationState}`, broker: opportunity.brokerName, loadedMiles: opportunity.loadedMiles, deadheadMiles: opportunity.deadheadMiles, miles: (opportunity.loadedMiles ?? 0) + (opportunity.deadheadMiles ?? 0) + (opportunity.repositionMiles ?? 0), rate, pickupDate: opportunity.pickupDate, deliveryDate: opportunity.deliveryDate, commodity: opportunity.commodity, weightPounds: opportunity.weightPounds, notes: opportunity.notes, status: "BOOKED" } });
    await tx.freightOpportunity.update({ where: { id }, data: { convertedLoadId: created.id, convertedAt: new Date(), decisionStatus: "CONVERTED" } });
    return created;
  });
  revalidatePath("/loads"); revalidatePath("/freight-intelligence");
  redirect(`/loads/${load.id}`);
}
