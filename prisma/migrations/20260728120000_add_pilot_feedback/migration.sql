CREATE TABLE "PilotFeedback" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "workspaceId" TEXT NOT NULL,
  "submittedById" TEXT NOT NULL,
  "submittedByName" TEXT NOT NULL,
  "route" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "screenshotStatus" TEXT NOT NULL DEFAULT 'DISABLED_PENDING_ISOLATED_STORAGE',
  "viewportWidth" INTEGER,
  "viewportHeight" INTEGER,
  "userAgent" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "PilotFeedback_workspaceId_createdAt_idx" ON "PilotFeedback"("workspaceId", "createdAt");
