-- AlterTable
ALTER TABLE "BrokerContact" ADD COLUMN "deletedAt" DATETIME;

-- AlterTable
ALTER TABLE "DocumentAlert" ADD COLUMN "deletedAt" DATETIME;

-- AlterTable
ALTER TABLE "Expense" ADD COLUMN "deletedAt" DATETIME;

-- AlterTable
ALTER TABLE "InspectionChecklist" ADD COLUMN "deletedAt" DATETIME;

-- AlterTable
ALTER TABLE "Load" ADD COLUMN "deletedAt" DATETIME;

-- AlterTable
ALTER TABLE "LoadOpportunity" ADD COLUMN "deletedAt" DATETIME;

-- AlterTable
ALTER TABLE "MaintenanceItem" ADD COLUMN "deletedAt" DATETIME;

-- AlterTable
ALTER TABLE "MarketSignal" ADD COLUMN "deletedAt" DATETIME;

-- AlterTable
ALTER TABLE "ShipperLead" ADD COLUMN "deletedAt" DATETIME;

-- AlterTable
ALTER TABLE "SmartFuelStop" ADD COLUMN "deletedAt" DATETIME;

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "actor" TEXT,
    "reason" TEXT,
    "details" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
