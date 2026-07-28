-- Additive Freight Intelligence tables. Existing local records are preserved.
CREATE TABLE "EquipmentProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "equipmentType" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "vehicleYear" INTEGER, "vehicleMake" TEXT, "vehicleModel" TEXT, "unitNumber" TEXT,
    "cargoLengthFeet" REAL, "cargoWidthInches" REAL, "cargoHeightInches" REAL,
    "doorWidthInches" REAL, "doorHeightInches" REAL, "palletCapacity" INTEGER,
    "maximumPayloadPounds" REAL, "vehicleGvwrPounds" REAL, "trailerGvwrPounds" REAL, "combinedRatingPounds" REAL,
    "estimatedMpg" REAL, "maintenancePerMile" REAL, "insurancePerWeek" REAL, "paymentPerWeek" REAL,
    "defaultDispatchPercent" REAL, "minimumEffectiveRpm" REAL, "minimumProjectedProfit" REAL,
    "notes" TEXT, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL
);
CREATE TABLE "FreightOpportunity" (
    "id" TEXT NOT NULL PRIMARY KEY, "source" TEXT, "externalReference" TEXT,
    "capturedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "originCity" TEXT NOT NULL, "originState" TEXT NOT NULL, "originZip" TEXT,
    "destinationCity" TEXT NOT NULL, "destinationState" TEXT NOT NULL, "destinationZip" TEXT,
    "loadedMiles" REAL, "deadheadMiles" REAL, "repositionMiles" REAL, "stopCount" INTEGER NOT NULL DEFAULT 1,
    "pickupDate" DATETIME, "deliveryDate" DATETIME, "pickupWindow" TEXT, "deliveryWindow" TEXT,
    "commodity" TEXT, "weightPounds" REAL, "palletCount" INTEGER, "requiredLengthFeet" REAL, "requiredEquipmentType" TEXT,
    "offeredRate" REAL, "openingAsk" REAL, "targetRate" REAL, "walkAwayRate" REAL, "finalNegotiatedRate" REAL,
    "estimatedFuelPrice" REAL, "estimatedTolls" REAL, "estimatedOtherExpenses" REAL, "dispatchPercent" REAL, "maintenancePerMile" REAL,
    "brokerName" TEXT, "brokerMcNumber" TEXT, "brokerContactName" TEXT, "brokerPhone" TEXT, "brokerEmail" TEXT,
    "brokerVerified" BOOLEAN NOT NULL DEFAULT false, "compatibilityStatus" TEXT NOT NULL DEFAULT 'REVIEW_REQUIRED',
    "decisionStatus" TEXT NOT NULL DEFAULT 'NEW', "compatibilityReasons" TEXT, "rejectionReason" TEXT, "notes" TEXT,
    "equipmentProfileId" TEXT, "convertedLoadId" TEXT, "convertedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FreightOpportunity_equipmentProfileId_fkey" FOREIGN KEY ("equipmentProfileId") REFERENCES "EquipmentProfile" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "FreightOpportunity_convertedLoadId_fkey" FOREIGN KEY ("convertedLoadId") REFERENCES "Load" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE TABLE "FreightNegotiation" (
    "id" TEXT NOT NULL PRIMARY KEY, "opportunityId" TEXT NOT NULL, "negotiationType" TEXT NOT NULL, "amount" REAL,
    "message" TEXT, "contactName" TEXT, "occurredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FreightNegotiation_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "FreightOpportunity" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "FreightOpportunity_convertedLoadId_key" ON "FreightOpportunity"("convertedLoadId");
