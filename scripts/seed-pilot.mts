import { prisma } from "../src/lib/prisma.ts";
import { resetAndSeedPilotWorkspace } from "../src/lib/pilot-seed.ts";

if (process.env.PILOT_MODE !== "true") {
  throw new Error("Refusing to seed unless PILOT_MODE=true.");
}

const workspaceId = process.env.PILOT_WORKSPACE_ID?.trim() || "mills-trucking-pilot";

try {
  await resetAndSeedPilotWorkspace(prisma, workspaceId);
  console.log(`Restored fictional pilot seed for ${workspaceId}.`);
} finally {
  await prisma.$disconnect();
}
