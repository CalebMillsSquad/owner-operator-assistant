"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireOperatorRole, requirePilotWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resetAndSeedPilotWorkspace } from "@/lib/pilot-seed";

const feedbackCategories = new Set(["BUG", "CONFUSING", "IDEA", "DATA_ISSUE", "ACCESSIBILITY", "OTHER"]);

export async function submitPilotFeedbackAction(formData: FormData) {
  const session = await requirePilotWorkspace();
  const route = String(formData.get("route") ?? "").trim();
  const category = String(formData.get("category") ?? "OTHER");
  const description = String(formData.get("description") ?? "").trim();
  const viewportWidth = Number(formData.get("viewportWidth"));
  const viewportHeight = Number(formData.get("viewportHeight"));

  if (!route.startsWith("/") || !feedbackCategories.has(category) || description.length < 5 || description.length > 4000) {
    throw new Error("Feedback requires a valid route, category, and description between 5 and 4,000 characters.");
  }

  const requestHeaders = await headers();
  await prisma.pilotFeedback.create({
    data: {
      workspaceId: session.workspaceId,
      submittedById: session.id,
      submittedByName: session.name,
      route,
      category: category as "BUG" | "CONFUSING" | "IDEA" | "DATA_ISSUE" | "ACCESSIBILITY" | "OTHER",
      description,
      viewportWidth: Number.isInteger(viewportWidth) && viewportWidth > 0 ? viewportWidth : null,
      viewportHeight: Number.isInteger(viewportHeight) && viewportHeight > 0 ? viewportHeight : null,
      userAgent: requestHeaders.get("user-agent")?.slice(0, 1000) ?? null,
    },
  });

  revalidatePath("/pilot");
  redirect(`${route}?feedback=received`);
}

export async function resetPilotWorkspaceAction() {
  const session = await requireOperatorRole("OWNER");
  if (process.env.PILOT_MODE !== "true" || session.workspaceId !== (process.env.PILOT_WORKSPACE_ID || "mills-trucking-pilot")) {
    throw new Error("Pilot reset is unavailable outside the isolated pilot workspace.");
  }

  await resetAndSeedPilotWorkspace(prisma, session.workspaceId);
  revalidatePath("/", "layout");
  redirect("/pilot?reset=complete");
}
