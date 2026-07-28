-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "LoadStatus" AS ENUM ('BOOKED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ExpenseCategory" AS ENUM ('FUEL', 'OIL', 'TIRES', 'REPAIRS', 'TOLLS', 'SCALES', 'PERMITS', 'INSURANCE', 'FOOD', 'OTHER');

-- CreateEnum
CREATE TYPE "DocumentAlertStatus" AS ENUM ('CURRENT', 'EXPIRING_SOON', 'EXPIRED', 'MISSING');

-- CreateEnum
CREATE TYPE "MaintenanceStatus" AS ENUM ('UPCOMING', 'DUE_SOON', 'OVERDUE', 'COMPLETED');

-- CreateEnum
CREATE TYPE "InspectionType" AS ENUM ('PRE_TRIP', 'POST_TRIP');

-- CreateEnum
CREATE TYPE "LoadSourceType" AS ENUM ('LOAD_BOARD', 'BROKER', 'CARRIER_NETWORK', 'DIRECT_SHIPPER', 'DISPATCH_REFERRAL', 'BACKHAUL', 'OTHER');

-- CreateEnum
CREATE TYPE "LoadOpportunityStatus" AS ENUM ('NEW', 'REVIEWING', 'CONTACTED', 'NEGOTIATING', 'BOOKED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "OpportunityPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "MarketDemandLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'HOT');

-- CreateEnum
CREATE TYPE "MarketSignalSource" AS ENUM ('BROKER', 'LOAD_BOARD', 'CARRIER', 'SHIPPER', 'PERSONAL_OBSERVATION', 'OTHER');

-- CreateEnum
CREATE TYPE "BrokerRelationshipStatus" AS ENUM ('NEW', 'ACTIVE', 'PREFERRED', 'WATCHLIST', 'DO_NOT_USE');

-- CreateEnum
CREATE TYPE "ShipperLeadStatus" AS ENUM ('LEAD', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'ACTIVE', 'LOST');

-- CreateEnum
CREATE TYPE "EquipmentType" AS ENUM ('CARGO_VAN', 'SPRINTER_VAN', 'BOX_TRUCK_16', 'BOX_TRUCK_20', 'BOX_TRUCK_24', 'BOX_TRUCK_26', 'DRY_VAN_48', 'DRY_VAN_53', 'FLATBED', 'PICKUP_ENCLOSED_TRAILER', 'PICKUP_FLATBED_TRAILER', 'POWER_ONLY', 'SMALL_STRAIGHT_TRUCK', 'OTHER');

-- CreateEnum
CREATE TYPE "CompatibilityStatus" AS ENUM ('COMPATIBLE', 'INCOMPATIBLE', 'REVIEW_REQUIRED');

-- CreateEnum
CREATE TYPE "FreightOpportunityStatus" AS ENUM ('NEW', 'REVIEWING', 'QUALIFIED', 'NEGOTIATING', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CONVERTED');

-- CreateEnum
CREATE TYPE "NegotiationType" AS ENUM ('BROKER_OFFER', 'DISPATCHER_COUNTER', 'BROKER_COUNTER', 'DRIVER_MINIMUM', 'TERMS_UPDATE', 'FINAL_AGREEMENT', 'NOTE');

-- CreateEnum
CREATE TYPE "PilotFeedbackCategory" AS ENUM ('BUG', 'CONFUSING', 'IDEA', 'DATA_ISSUE', 'ACCESSIBILITY', 'OTHER');

-- CreateTable
CREATE TABLE "PilotFeedback" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "submittedById" TEXT NOT NULL,
    "submittedByName" TEXT NOT NULL,
    "route" TEXT NOT NULL,
    "category" "PilotFeedbackCategory" NOT NULL,
    "description" TEXT NOT NULL,
    "screenshotStatus" TEXT NOT NULL DEFAULT 'DISABLED_PENDING_ISOLATED_STORAGE',
    "viewportWidth" INTEGER,
    "viewportHeight" INTEGER,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PilotFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Load" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL DEFAULT 'mills-trucking-pilot',
    "loadNumber" TEXT,
    "broker" TEXT,
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "miles" DOUBLE PRECISION,
    "loadedMiles" DOUBLE PRECISION,
    "deadheadMiles" DOUBLE PRECISION,
    "rate" DOUBLE PRECISION,
    "ratePerMile" DOUBLE PRECISION,
    "status" "LoadStatus" NOT NULL DEFAULT 'BOOKED',
    "pickupDate" TIMESTAMP(3),
    "deliveryDate" TIMESTAMP(3),
    "commodity" TEXT,
    "weightPounds" DOUBLE PRECISION,
    "notes" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Load_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL DEFAULT 'mills-trucking-pilot',
    "loadId" TEXT,
    "category" "ExpenseCategory" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "expenseDate" TIMESTAMP(3) NOT NULL,
    "vendor" TEXT,
    "location" TEXT,
    "notes" TEXT,
    "receiptPath" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FuelLog" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL DEFAULT 'mills-trucking-pilot',
    "fuelDate" TIMESTAMP(3) NOT NULL,
    "gallons" DOUBLE PRECISION NOT NULL,
    "pricePerGallon" DOUBLE PRECISION NOT NULL,
    "totalCost" DOUBLE PRECISION NOT NULL,
    "vendor" TEXT,
    "location" TEXT,
    "odometer" DOUBLE PRECISION,
    "state" TEXT,
    "receiptReference" TEXT,
    "notes" TEXT,
    "loadId" TEXT,
    "expenseId" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FuelLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentAlert" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL DEFAULT 'mills-trucking-pilot',
    "title" TEXT NOT NULL,
    "expiresDate" TIMESTAMP(3),
    "status" "DocumentAlertStatus" NOT NULL DEFAULT 'CURRENT',
    "notes" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenanceItem" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL DEFAULT 'mills-trucking-pilot',
    "title" TEXT NOT NULL,
    "dueMileage" DOUBLE PRECISION,
    "dueDate" TIMESTAMP(3),
    "lastServiceDate" TIMESTAMP(3),
    "lastServiceMileage" DOUBLE PRECISION,
    "currentMileage" DOUBLE PRECISION,
    "status" "MaintenanceStatus" NOT NULL DEFAULT 'UPCOMING',
    "notes" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaintenanceItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InspectionChecklist" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL DEFAULT 'mills-trucking-pilot',
    "inspectionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "InspectionType" NOT NULL,
    "odometer" DOUBLE PRECISION,
    "overallPassed" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InspectionChecklist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InspectionItem" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL DEFAULT 'mills-trucking-pilot',
    "checklistId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "item" TEXT NOT NULL,
    "passed" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,

    CONSTRAINT "InspectionItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoadOpportunity" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL DEFAULT 'mills-trucking-pilot',
    "sourceType" "LoadSourceType" NOT NULL,
    "sourceName" TEXT,
    "brokerName" TEXT,
    "shipperName" TEXT,
    "contactName" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "pickupDate" TIMESTAMP(3),
    "deliveryDate" TIMESTAMP(3),
    "equipmentType" TEXT,
    "rate" DOUBLE PRECISION,
    "miles" DOUBLE PRECISION,
    "ratePerMile" DOUBLE PRECISION,
    "weight" DOUBLE PRECISION,
    "commodity" TEXT,
    "status" "LoadOpportunityStatus" NOT NULL DEFAULT 'NEW',
    "priority" "OpportunityPriority" NOT NULL DEFAULT 'MEDIUM',
    "notes" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LoadOpportunity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EquipmentProfile" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL DEFAULT 'mills-trucking-pilot',
    "name" TEXT NOT NULL,
    "equipmentType" "EquipmentType" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "vehicleYear" INTEGER,
    "vehicleMake" TEXT,
    "vehicleModel" TEXT,
    "unitNumber" TEXT,
    "cargoLengthFeet" DOUBLE PRECISION,
    "cargoWidthInches" DOUBLE PRECISION,
    "cargoHeightInches" DOUBLE PRECISION,
    "doorWidthInches" DOUBLE PRECISION,
    "doorHeightInches" DOUBLE PRECISION,
    "palletCapacity" INTEGER,
    "maximumPayloadPounds" DOUBLE PRECISION,
    "vehicleGvwrPounds" DOUBLE PRECISION,
    "trailerGvwrPounds" DOUBLE PRECISION,
    "combinedRatingPounds" DOUBLE PRECISION,
    "estimatedMpg" DOUBLE PRECISION,
    "maintenancePerMile" DOUBLE PRECISION,
    "insurancePerWeek" DOUBLE PRECISION,
    "paymentPerWeek" DOUBLE PRECISION,
    "defaultDispatchPercent" DOUBLE PRECISION,
    "minimumEffectiveRpm" DOUBLE PRECISION,
    "minimumProjectedProfit" DOUBLE PRECISION,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EquipmentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FreightOpportunity" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL DEFAULT 'mills-trucking-pilot',
    "source" TEXT,
    "externalReference" TEXT,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "originCity" TEXT NOT NULL,
    "originState" TEXT NOT NULL,
    "originZip" TEXT,
    "destinationCity" TEXT NOT NULL,
    "destinationState" TEXT NOT NULL,
    "destinationZip" TEXT,
    "loadedMiles" DOUBLE PRECISION,
    "deadheadMiles" DOUBLE PRECISION,
    "repositionMiles" DOUBLE PRECISION,
    "stopCount" INTEGER NOT NULL DEFAULT 1,
    "pickupDate" TIMESTAMP(3),
    "deliveryDate" TIMESTAMP(3),
    "pickupWindow" TEXT,
    "deliveryWindow" TEXT,
    "commodity" TEXT,
    "weightPounds" DOUBLE PRECISION,
    "palletCount" INTEGER,
    "requiredLengthFeet" DOUBLE PRECISION,
    "requiredEquipmentType" "EquipmentType",
    "offeredRate" DOUBLE PRECISION,
    "openingAsk" DOUBLE PRECISION,
    "targetRate" DOUBLE PRECISION,
    "walkAwayRate" DOUBLE PRECISION,
    "finalNegotiatedRate" DOUBLE PRECISION,
    "estimatedFuelPrice" DOUBLE PRECISION,
    "estimatedTolls" DOUBLE PRECISION,
    "estimatedOtherExpenses" DOUBLE PRECISION,
    "dispatchPercent" DOUBLE PRECISION,
    "maintenancePerMile" DOUBLE PRECISION,
    "brokerName" TEXT,
    "brokerMcNumber" TEXT,
    "brokerContactName" TEXT,
    "brokerPhone" TEXT,
    "brokerEmail" TEXT,
    "brokerVerified" BOOLEAN NOT NULL DEFAULT false,
    "compatibilityStatus" "CompatibilityStatus" NOT NULL DEFAULT 'REVIEW_REQUIRED',
    "decisionStatus" "FreightOpportunityStatus" NOT NULL DEFAULT 'NEW',
    "compatibilityReasons" TEXT,
    "rejectionReason" TEXT,
    "notes" TEXT,
    "equipmentProfileId" TEXT,
    "convertedLoadId" TEXT,
    "convertedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FreightOpportunity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FreightNegotiation" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL DEFAULT 'mills-trucking-pilot',
    "opportunityId" TEXT NOT NULL,
    "negotiationType" "NegotiationType" NOT NULL,
    "amount" DOUBLE PRECISION,
    "message" TEXT,
    "contactName" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FreightNegotiation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketSignal" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL DEFAULT 'mills-trucking-pilot',
    "marketName" TEXT NOT NULL,
    "originRegion" TEXT,
    "destinationRegion" TEXT,
    "equipmentType" TEXT,
    "demandLevel" "MarketDemandLevel" NOT NULL DEFAULT 'MEDIUM',
    "sourceType" "MarketSignalSource" NOT NULL,
    "sourceName" TEXT,
    "notes" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketSignal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrokerContact" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL DEFAULT 'mills-trucking-pilot',
    "companyName" TEXT NOT NULL,
    "contactName" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "preferredLanes" TEXT,
    "equipmentNeeds" TEXT,
    "paymentNotes" TEXT,
    "relationshipStatus" "BrokerRelationshipStatus" NOT NULL DEFAULT 'NEW',
    "notes" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrokerContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShipperLead" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL DEFAULT 'mills-trucking-pilot',
    "companyName" TEXT NOT NULL,
    "industry" TEXT,
    "contactName" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "location" TEXT,
    "recurringLanes" TEXT,
    "freightType" TEXT,
    "status" "ShipperLeadStatus" NOT NULL DEFAULT 'LEAD',
    "notes" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShipperLead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SmartFuelStop" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL DEFAULT 'mills-trucking-pilot',
    "truckStopName" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "state" TEXT,
    "fuelPrice" DOUBLE PRECISION,
    "routeName" TEXT,
    "gallonsPlanned" DOUBLE PRECISION,
    "estimatedCost" DOUBLE PRECISION,
    "iftaNote" TEXT,
    "preferred" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SmartFuelStop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL DEFAULT 'mills-trucking-pilot',
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "actor" TEXT,
    "reason" TEXT,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PilotFeedback_workspaceId_createdAt_idx" ON "PilotFeedback"("workspaceId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "FuelLog_expenseId_key" ON "FuelLog"("expenseId");

-- CreateIndex
CREATE UNIQUE INDEX "FreightOpportunity_convertedLoadId_key" ON "FreightOpportunity"("convertedLoadId");

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_loadId_fkey" FOREIGN KEY ("loadId") REFERENCES "Load"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FuelLog" ADD CONSTRAINT "FuelLog_loadId_fkey" FOREIGN KEY ("loadId") REFERENCES "Load"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FuelLog" ADD CONSTRAINT "FuelLog_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "Expense"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InspectionItem" ADD CONSTRAINT "InspectionItem_checklistId_fkey" FOREIGN KEY ("checklistId") REFERENCES "InspectionChecklist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FreightOpportunity" ADD CONSTRAINT "FreightOpportunity_equipmentProfileId_fkey" FOREIGN KEY ("equipmentProfileId") REFERENCES "EquipmentProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FreightOpportunity" ADD CONSTRAINT "FreightOpportunity_convertedLoadId_fkey" FOREIGN KEY ("convertedLoadId") REFERENCES "Load"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FreightNegotiation" ADD CONSTRAINT "FreightNegotiation_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "FreightOpportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
