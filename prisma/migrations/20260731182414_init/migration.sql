-- CreateTable
CREATE TABLE "Load" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "loadNumber" TEXT,
    "broker" TEXT,
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "miles" REAL,
    "rate" REAL,
    "ratePerMile" REAL,
    "status" TEXT NOT NULL DEFAULT 'BOOKED',
    "pickupDate" DATETIME,
    "deliveryDate" DATETIME,
    "commodity" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "loadId" TEXT,
    "category" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "expenseDate" DATETIME NOT NULL,
    "vendor" TEXT,
    "location" TEXT,
    "notes" TEXT,
    "receiptPath" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Expense_loadId_fkey" FOREIGN KEY ("loadId") REFERENCES "Load" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FuelLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fuelDate" DATETIME NOT NULL,
    "gallons" REAL NOT NULL,
    "pricePerGallon" REAL NOT NULL,
    "totalCost" REAL NOT NULL,
    "location" TEXT,
    "odometer" REAL,
    "state" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "DocumentAlert" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "expiresDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'CURRENT',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "MaintenanceItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "dueMileage" REAL,
    "dueDate" DATETIME,
    "lastServiceDate" DATETIME,
    "lastServiceMileage" REAL,
    "currentMileage" REAL,
    "status" TEXT NOT NULL DEFAULT 'UPCOMING',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "InspectionChecklist" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "inspectionDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "odometer" REAL,
    "overallPassed" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "InspectionItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "checklistId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "item" TEXT NOT NULL,
    "passed" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    CONSTRAINT "InspectionItem_checklistId_fkey" FOREIGN KEY ("checklistId") REFERENCES "InspectionChecklist" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
