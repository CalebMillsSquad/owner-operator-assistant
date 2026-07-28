import type { PrismaClient } from "@prisma/client";

function addDays(base: Date, days: number) {
  const date = new Date(base);
  date.setDate(date.getDate() + days);
  date.setHours(12, 0, 0, 0);
  return date;
}

export async function resetAndSeedPilotWorkspace(prisma: PrismaClient, workspaceId: string) {
  const now = new Date();
  now.setHours(12, 0, 0, 0);

  await prisma.$transaction(async (tx) => {
    const scope = { workspaceId };
    await tx.freightNegotiation.deleteMany({ where: scope });
    await tx.freightOpportunity.deleteMany({ where: scope });
    await tx.equipmentProfile.deleteMany({ where: scope });
    await tx.fuelLog.deleteMany({ where: scope });
    await tx.expense.deleteMany({ where: scope });
    await tx.inspectionItem.deleteMany({ where: scope });
    await tx.inspectionChecklist.deleteMany({ where: scope });
    await tx.loadOpportunity.deleteMany({ where: scope });
    await tx.marketSignal.deleteMany({ where: scope });
    await tx.brokerContact.deleteMany({ where: scope });
    await tx.shipperLead.deleteMany({ where: scope });
    await tx.smartFuelStop.deleteMany({ where: scope });
    await tx.documentAlert.deleteMany({ where: scope });
    await tx.maintenanceItem.deleteMany({ where: scope });
    await tx.auditLog.deleteMany({ where: scope });
    await tx.load.deleteMany({ where: scope });

    await tx.equipmentProfile.create({ data: {
      id: "pilot-equipment-tractor-53",
      workspaceId,
      name: "Mills Unit 204 with 53-foot dry van",
      equipmentType: "DRY_VAN_53",
      vehicleYear: 2022,
      vehicleMake: "Fictional Motors",
      vehicleModel: "Roadline 680",
      unitNumber: "TEST-204",
      cargoLengthFeet: 53,
      cargoWidthInches: 102,
      cargoHeightInches: 110,
      palletCapacity: 26,
      maximumPayloadPounds: 44500,
      estimatedMpg: 7.1,
      maintenancePerMile: 0.19,
      defaultDispatchPercent: 5,
      minimumEffectiveRpm: 2.15,
      minimumProjectedProfit: 650,
      notes: "Fictional pilot equipment. Not a real vehicle or rating.",
    } });

    await tx.load.createMany({ data: [
      { id: "pilot-load-booked", workspaceId, loadNumber: "PILOT-2407", broker: "Cedar Ridge Logistics", origin: "Nashville, TN", destination: "Charlotte, NC", loadedMiles: 409, deadheadMiles: 32, miles: 409, rate: 2150, ratePerMile: 5.2567, status: "BOOKED", pickupDate: addDays(now, 1), deliveryDate: addDays(now, 2), commodity: "Packaged paper products", weightPounds: 38200, notes: "Fictional booked load for pilot testing." },
      { id: "pilot-load-completed-1", workspaceId, loadNumber: "PILOT-2398", broker: "Blue River Freight", origin: "Memphis, TN", destination: "Dallas, TX", loadedMiles: 452, deadheadMiles: 41, miles: 452, rate: 2425, ratePerMile: 5.365, status: "DELIVERED", pickupDate: addDays(now, -8), deliveryDate: addDays(now, -7), commodity: "Retail fixtures", weightPounds: 34750, notes: "Fictional completed load with linked operating costs." },
      { id: "pilot-load-completed-2", workspaceId, loadNumber: "PILOT-2389", broker: "Volunteer Logistics Group", origin: "Knoxville, TN", destination: "Richmond, VA", loadedMiles: 421, deadheadMiles: 55, miles: 421, rate: 2250, ratePerMile: 5.344, status: "DELIVERED", pickupDate: addDays(now, -16), deliveryDate: addDays(now, -15), commodity: "Consumer goods", weightPounds: 40100, notes: "Fictional history record for profitability comparison." },
    ] });

    await tx.expense.createMany({ data: [
      { id: "pilot-expense-fuel-1", workspaceId, loadId: "pilot-load-completed-1", category: "FUEL", amount: 438.72, expenseDate: addDays(now, -8), vendor: "Test Fuel Plaza", location: "West Memphis, AR", receiptPath: null, notes: "Fictional fuel expense. No receipt file is stored." },
      { id: "pilot-expense-toll-1", workspaceId, loadId: "pilot-load-completed-1", category: "TOLLS", amount: 32.5, expenseDate: addDays(now, -7), vendor: "Test Toll Network", location: "Arkansas", notes: "Fictional toll expense." },
      { id: "pilot-expense-fuel-2", workspaceId, loadId: "pilot-load-completed-2", category: "FUEL", amount: 411.18, expenseDate: addDays(now, -16), vendor: "Test Travel Center", location: "Bristol, TN", receiptPath: null, notes: "Fictional fuel expense. No receipt file is stored." },
      { id: "pilot-expense-maintenance", workspaceId, category: "REPAIRS", amount: 284.4, expenseDate: addDays(now, -5), vendor: "Fictional Fleet Service", location: "Nashville, TN", notes: "Fictional operating expense." },
    ] });

    await tx.fuelLog.createMany({ data: [
      { id: "pilot-fuel-1", workspaceId, fuelDate: addDays(now, -8), gallons: 112, pricePerGallon: 3.917142857, totalCost: 438.72, vendor: "Test Fuel Plaza", location: "West Memphis, AR", state: "AR", odometer: 412340, receiptReference: "PILOT-NO-FILE-001", notes: "Fictional fuel purchase; uploads disabled.", loadId: "pilot-load-completed-1", expenseId: "pilot-expense-fuel-1" },
      { id: "pilot-fuel-2", workspaceId, fuelDate: addDays(now, -16), gallons: 106, pricePerGallon: 3.878, totalCost: 411.18, vendor: "Test Travel Center", location: "Bristol, TN", state: "TN", odometer: 411802, receiptReference: "PILOT-NO-FILE-002", notes: "Fictional fuel purchase; uploads disabled.", loadId: "pilot-load-completed-2", expenseId: "pilot-expense-fuel-2" },
    ] });

    await tx.freightOpportunity.create({ data: {
      id: "pilot-freight-negotiating", workspaceId, source: "Manual pilot entry", externalReference: "TEST-OPP-8841", originCity: "Louisville", originState: "KY", destinationCity: "Atlanta", destinationState: "GA", loadedMiles: 421, deadheadMiles: 48, stopCount: 1, pickupDate: addDays(now, 2), deliveryDate: addDays(now, 3), commodity: "Boxed appliances", weightPounds: 39200, palletCount: 22, requiredLengthFeet: 53, requiredEquipmentType: "DRY_VAN_53", offeredRate: 1900, openingAsk: 2350, targetRate: 2250, walkAwayRate: 2050, estimatedFuelPrice: 3.79, estimatedTolls: 22, dispatchPercent: 5, maintenancePerMile: 0.19, brokerName: "Summit Test Logistics", brokerMcNumber: "MC-TEST-1042", brokerContactName: "Jordan Example", brokerPhone: "555-010-2040", brokerEmail: "pilot-broker@example.invalid", brokerVerified: false, compatibilityStatus: "COMPATIBLE", decisionStatus: "NEGOTIATING", compatibilityReasons: "Pilot equipment dimensions and payload support this fictional opportunity.", notes: "Fictional negotiation scenario.", equipmentProfileId: "pilot-equipment-tractor-53",
      negotiations: { create: [
        { id: "pilot-negotiation-offer", workspaceId, negotiationType: "BROKER_OFFER", amount: 1900, message: "Initial fictional offer.", contactName: "Jordan Example", occurredAt: addDays(now, 0) },
        { id: "pilot-negotiation-counter", workspaceId, negotiationType: "DISPATCHER_COUNTER", amount: 2250, message: "Pilot counter based on total operational miles.", contactName: "Mills Pilot Tester", occurredAt: addDays(now, 0) },
      ] },
    } });
    await tx.freightOpportunity.create({ data: { id: "pilot-freight-review", workspaceId, source: "Manual pilot entry", externalReference: "TEST-OPP-8847", originCity: "Birmingham", originState: "AL", destinationCity: "Savannah", destinationState: "GA", loadedMiles: 392, deadheadMiles: 76, stopCount: 2, pickupDate: addDays(now, 4), deliveryDate: addDays(now, 5), commodity: "General dry freight", weightPounds: 43800, requiredLengthFeet: 53, requiredEquipmentType: "DRY_VAN_53", offeredRate: 1875, estimatedFuelPrice: 3.82, brokerName: "Harbor Test Transport", brokerMcNumber: "MC-TEST-2088", brokerVerified: false, compatibilityStatus: "REVIEW_REQUIRED", decisionStatus: "REVIEWING", compatibilityReasons: "Payload is near the fictional equipment limit; confirm final weight and schedule.", notes: "Fictional review-required opportunity.", equipmentProfileId: "pilot-equipment-tractor-53" } });

    await tx.documentAlert.createMany({ data: [
      { id: "pilot-doc-insurance", workspaceId, title: "Pilot cargo insurance certificate", expiresDate: addDays(now, 18), status: "EXPIRING_SOON", notes: "Fictional alert; no document is stored." },
      { id: "pilot-doc-permit", workspaceId, title: "Pilot operating permit", status: "MISSING", notes: "Fictional missing-document scenario; uploads disabled." },
    ] });
    await tx.maintenanceItem.createMany({ data: [
      { id: "pilot-maint-oil", workspaceId, title: "Engine oil service", dueMileage: 412800, lastServiceDate: addDays(now, -44), lastServiceMileage: 397800, currentMileage: 412340, status: "DUE_SOON", notes: "Fictional maintenance reminder." },
      { id: "pilot-maint-inspection", workspaceId, title: "Annual inspection", dueDate: addDays(now, 12), lastServiceDate: addDays(now, -353), currentMileage: 412340, status: "DUE_SOON", notes: "Fictional readiness reminder." },
    ] });
    await tx.auditLog.create({ data: { id: "pilot-audit-seed", workspaceId, entityType: "PilotWorkspace", entityId: workspaceId, action: "PILOT_RESET", actor: "system", reason: "Original fictional seed restored", details: "No real records or uploaded files were copied." } });
  });
}
