-- CreateTable
CREATE TABLE "LoadOpportunity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sourceType" TEXT NOT NULL,
    "sourceName" TEXT,
    "brokerName" TEXT,
    "shipperName" TEXT,
    "contactName" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "pickupDate" DATETIME,
    "deliveryDate" DATETIME,
    "equipmentType" TEXT,
    "rate" REAL,
    "miles" REAL,
    "ratePerMile" REAL,
    "weight" REAL,
    "commodity" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "MarketSignal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "marketName" TEXT NOT NULL,
    "originRegion" TEXT,
    "destinationRegion" TEXT,
    "equipmentType" TEXT,
    "demandLevel" TEXT NOT NULL DEFAULT 'MEDIUM',
    "sourceType" TEXT NOT NULL,
    "sourceName" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "BrokerContact" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyName" TEXT NOT NULL,
    "contactName" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "preferredLanes" TEXT,
    "equipmentNeeds" TEXT,
    "paymentNotes" TEXT,
    "relationshipStatus" TEXT NOT NULL DEFAULT 'NEW',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ShipperLead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyName" TEXT NOT NULL,
    "industry" TEXT,
    "contactName" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "location" TEXT,
    "recurringLanes" TEXT,
    "freightType" TEXT,
    "status" TEXT NOT NULL DEFAULT 'LEAD',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SmartFuelStop" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "truckStopName" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "state" TEXT,
    "fuelPrice" REAL,
    "routeName" TEXT,
    "gallonsPlanned" REAL,
    "estimatedCost" REAL,
    "iftaNote" TEXT,
    "preferred" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
