import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaBetterSqlite3({ url: process.env.OWNER_OPERATOR_DATABASE_URL ?? "file:./dev.db" });
const prisma = new PrismaClient({ adapter, log: ["error"] });

const inspectionItems = [
  { category: "Brakes", item: "Brake adjustment" },
  { category: "Brakes", item: "Brake drums/rotors" },
  { category: "Lights", item: "Headlights" },
  { category: "Lights", item: "Tail lights" },
  { category: "Lights", item: "Turn signals" },
  { category: "Tires", item: "Tire pressure" },
  { category: "Tires", item: "Tread depth" },
  { category: "Tires", item: "No damage or bulges" },
  { category: "Engine", item: "Oil level" },
  { category: "Engine", item: "Coolant level" },
  { category: "Engine", item: "No leaks visible" },
  { category: "Cab", item: "Mirrors adjusted" },
  { category: "Cab", item: "Seat belt operational" },
  { category: "Cab", item: "Horn works" },
  { category: "Cargo", item: "Load secured" },
  { category: "Cargo", item: "Doors/tarps secured" },
];

function atNoon(date) {
  const next = new Date(date);
  next.setHours(12, 0, 0, 0);
  return next;
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return atNoon(next);
}

function startOfCurrentWeek(now = new Date()) {
  const start = atNoon(now);
  const day = start.getDay();
  const daysFromMonday = day === 0 ? 6 : day - 1;
  start.setDate(start.getDate() - daysFromMonday);
  return start;
}

function ratePerMile(rate, miles) {
  return rate && miles ? rate / miles : null;
}

async function main() {
  const now = atNoon(new Date());
  const weekStart = startOfCurrentWeek(now);
  const mileage = 588125;

  const loads = [
    {
      id: "seed-load-memphis-dallas",
      loadNumber: "DEMO-1042",
      broker: "Blue Oak Logistics",
      origin: "Memphis, TN",
      destination: "Dallas, TX",
      miles: 452,
      loadedMiles: 452,
      deadheadMiles: 38,
      rate: 2400,
      status: "IN_TRANSIT",
      pickupDate: addDays(weekStart, 1),
      deliveryDate: addDays(weekStart, 2),
      commodity: "Paper goods",
      notes: "Active load with fuel and scale expenses attached.",
    },
    {
      id: "seed-load-dallas-tulsa",
      loadNumber: "DEMO-1038",
      broker: "Red River Freight",
      origin: "Dallas, TX",
      destination: "Tulsa, OK",
      miles: 258,
      loadedMiles: 258,
      deadheadMiles: 22,
      rate: 1350,
      status: "DELIVERED",
      pickupDate: addDays(weekStart, 0),
      deliveryDate: addDays(weekStart, 1),
      commodity: "Retail freight",
      notes: "Delivered load with expenses tied back for net-per-load review.",
    },
    {
      id: "seed-load-nashville-knoxville",
      loadNumber: "DEMO-1051",
      broker: "Volunteer State Logistics",
      origin: "Nashville, TN",
      destination: "Knoxville, TN",
      miles: null,
      loadedMiles: null,
      deadheadMiles: null,
      rate: null,
      status: "BOOKED",
      pickupDate: addDays(now, 1),
      deliveryDate: addDays(now, 2),
      commodity: "Auto parts",
      notes: "Booked load intentionally missing rate and mileage for assistant recommendations.",
    },
    {
      id: "seed-load-little-rock-st-louis",
      loadNumber: "DEMO-1035",
      broker: "Ozark Freight Partners",
      origin: "Little Rock, AR",
      destination: "St. Louis, MO",
      miles: 410,
      loadedMiles: 410,
      deadheadMiles: 64,
      rate: 1850,
      status: "DELIVERED",
      pickupDate: addDays(weekStart, 2),
      deliveryDate: addDays(weekStart, 3),
      commodity: "Dry van general freight",
      notes: "Delivered load without seed expenses so the assistant can suggest expense capture.",
    },
  ];

  for (const load of loads) {
    await prisma.load.upsert({
      where: { id: load.id },
      update: { ...load, ratePerMile: ratePerMile(load.rate, load.miles) },
      create: { ...load, ratePerMile: ratePerMile(load.rate, load.miles) },
    });
  }

  const expenses = [
    {
      id: "seed-expense-fuel-memphis-dallas",
      loadId: "seed-load-memphis-dallas",
      category: "FUEL",
      amount: 482.16,
      expenseDate: addDays(weekStart, 1),
      vendor: "Love's",
      location: "West Memphis, AR",
      receiptPath: "DEMO-FUEL-1042",
      notes: "Fuel card purchase attached to the active Dallas load.",
    },
    {
      id: "seed-expense-scale-memphis-dallas",
      loadId: "seed-load-memphis-dallas",
      category: "SCALES",
      amount: 13.5,
      expenseDate: addDays(weekStart, 1),
      vendor: "CAT Scale",
      location: "Memphis, TN",
      notes: "Scale ticket for the Dallas load.",
    },
    {
      id: "seed-expense-fuel-dallas-tulsa",
      loadId: "seed-load-dallas-tulsa",
      category: "FUEL",
      amount: 221.42,
      expenseDate: addDays(weekStart, 1),
      vendor: "Pilot",
      location: "Denison, TX",
      receiptPath: "DEMO-FUEL-1038",
      notes: "Trip fuel tied to the delivered Tulsa load.",
    },
    {
      id: "seed-expense-lumper-dallas-tulsa",
      loadId: "seed-load-dallas-tulsa",
      category: "OTHER",
      amount: 175,
      expenseDate: addDays(weekStart, 1),
      vendor: "Lumper Service",
      location: "Tulsa, OK",
      notes: "Lumper receipt needs review before final closeout.",
    },
    {
      id: "seed-expense-unassigned-repair",
      loadId: null,
      category: "REPAIRS",
      amount: 389.72,
      expenseDate: addDays(weekStart, 3),
      vendor: "TA Truck Service",
      location: "Little Rock, AR",
      notes: "Unassigned repair cost that still belongs in weekly net.",
    },
  ];

  for (const expense of expenses) {
    await prisma.expense.upsert({
      where: { id: expense.id },
      update: expense,
      create: expense,
    });
  }

  const fuelLogs = [
    {
      id: "seed-fuel-memphis-dallas",
      fuelDate: addDays(weekStart, 1),
      gallons: 124,
      pricePerGallon: 3.8883870968,
      totalCost: 482.16,
      vendor: "Love's",
      location: "West Memphis, AR",
      state: "AR",
      odometer: mileage - 612,
      receiptReference: "DEMO-FUEL-1042",
      notes: "Fuel card purchase attached to the active Dallas load.",
      loadId: "seed-load-memphis-dallas",
      expenseId: "seed-expense-fuel-memphis-dallas",
    },
    {
      id: "seed-fuel-dallas-tulsa",
      fuelDate: addDays(weekStart, 1),
      gallons: 58,
      pricePerGallon: 3.8175862069,
      totalCost: 221.42,
      vendor: "Pilot",
      location: "Denison, TX",
      state: "TX",
      odometer: mileage - 274,
      receiptReference: "DEMO-FUEL-1038",
      notes: "Trip fuel tied to the delivered Tulsa load.",
      loadId: "seed-load-dallas-tulsa",
      expenseId: "seed-expense-fuel-dallas-tulsa",
    },
  ];

  for (const fuelLog of fuelLogs) {
    await prisma.fuelLog.upsert({
      where: { id: fuelLog.id },
      update: { ...fuelLog, deletedAt: null },
      create: fuelLog,
    });
  }

  const documents = [
    {
      id: "seed-doc-insurance-expired",
      title: "Cargo insurance certificate",
      expiresDate: addDays(now, -3),
      status: "EXPIRED",
      notes: "Expired document should be renewed before booking sensitive freight.",
    },
    {
      id: "seed-doc-ifta-expiring",
      title: "IFTA decal",
      expiresDate: addDays(now, 21),
      status: "EXPIRING_SOON",
      notes: "Renewal is coming due soon.",
    },
    {
      id: "seed-doc-permit-missing",
      title: "New Mexico weight distance permit",
      expiresDate: null,
      status: "MISSING",
      notes: "Missing permit details should stay high in the assistant queue.",
    },
    {
      id: "seed-doc-registration-current",
      title: "Truck registration",
      expiresDate: addDays(now, 180),
      status: "CURRENT",
      notes: "Current document included so the documents page has a clear good state.",
    },
  ];

  for (const documentAlert of documents) {
    await prisma.documentAlert.upsert({
      where: { id: documentAlert.id },
      update: documentAlert,
      create: documentAlert,
    });
  }

  const maintenanceItems = [
    {
      id: "seed-maint-oil-overdue",
      title: "Oil change",
      dueMileage: 587500,
      dueDate: null,
      lastServiceDate: addDays(now, -52),
      lastServiceMileage: 572500,
      currentMileage: mileage,
      status: "OVERDUE",
      notes: "Mileage-based reminder is overdue.",
    },
    {
      id: "seed-maint-tire-rotation",
      title: "Drive tire rotation",
      dueMileage: 588900,
      dueDate: null,
      lastServiceDate: addDays(now, -34),
      lastServiceMileage: 577900,
      currentMileage: mileage,
      status: "DUE_SOON",
      notes: "Due soon by mileage.",
    },
    {
      id: "seed-maint-annual-inspection",
      title: "Annual inspection",
      dueMileage: null,
      dueDate: addDays(now, 10),
      lastServiceDate: addDays(now, -355),
      lastServiceMileage: 541400,
      currentMileage: mileage,
      status: "DUE_SOON",
      notes: "Date-based readiness reminder.",
    },
    {
      id: "seed-maint-air-filter-complete",
      title: "Air filter replacement",
      dueMileage: 586000,
      dueDate: addDays(now, -12),
      lastServiceDate: addDays(now, -7),
      lastServiceMileage: 587820,
      currentMileage: mileage,
      status: "COMPLETED",
      notes: "Completed item included for maintenance history context.",
    },
  ];

  for (const item of maintenanceItems) {
    await prisma.maintenanceItem.upsert({
      where: { id: item.id },
      update: item,
      create: item,
    });
  }

  const checklistId = "seed-inspection-today-pretrip";
  await prisma.inspectionChecklist.upsert({
    where: { id: checklistId },
    update: {
      inspectionDate: now,
      type: "PRE_TRIP",
      odometer: mileage,
      overallPassed: false,
      notes: "Demo pre-trip has failed items so the assistant surfaces inspection attention.",
    },
    create: {
      id: checklistId,
      inspectionDate: now,
      type: "PRE_TRIP",
      odometer: mileage,
      overallPassed: false,
      notes: "Demo pre-trip has failed items so the assistant surfaces inspection attention.",
    },
  });

  await prisma.inspectionItem.deleteMany({ where: { checklistId } });
  await prisma.inspectionItem.createMany({
    data: inspectionItems.map((item, index) => ({
      id: `seed-inspection-item-${index}`,
      checklistId,
      category: item.category,
      item: item.item,
      passed: item.item !== "Tail lights" && item.item !== "Tread depth",
      notes: item.item === "Tail lights" ? "Driver-side marker light out." : item.item === "Tread depth" ? "Outer drive tire needs review." : null,
    })),
  });

  console.log("Seeded owner-operator demo operations data.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
