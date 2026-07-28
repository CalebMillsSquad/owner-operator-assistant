-- Redefine FuelLog to add optional operational links while preserving existing records.
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_FuelLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fuelDate" DATETIME NOT NULL,
    "gallons" REAL NOT NULL,
    "pricePerGallon" REAL NOT NULL,
    "totalCost" REAL NOT NULL,
    "vendor" TEXT,
    "location" TEXT,
    "odometer" REAL,
    "state" TEXT,
    "receiptReference" TEXT,
    "notes" TEXT,
    "loadId" TEXT,
    "expenseId" TEXT,
    "deletedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FuelLog_loadId_fkey" FOREIGN KEY ("loadId") REFERENCES "Load" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "FuelLog_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "Expense" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

INSERT INTO "new_FuelLog" (
    "id", "fuelDate", "gallons", "pricePerGallon", "totalCost", "location", "odometer", "state", "notes", "createdAt", "updatedAt"
)
SELECT
    "id", "fuelDate", "gallons", "pricePerGallon", "totalCost", "location", "odometer", "state", "notes", "createdAt", "updatedAt"
FROM "FuelLog";

DROP TABLE "FuelLog";
ALTER TABLE "new_FuelLog" RENAME TO "FuelLog";
CREATE UNIQUE INDEX "FuelLog_expenseId_key" ON "FuelLog"("expenseId");

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

