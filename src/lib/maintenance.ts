import type { PrismaClient } from "@prisma/client";
import { MaintenanceStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";

type MaintenanceSnapshot = {
  dueDate: Date | null;
  dueMileage: number | null;
  currentMileage: number | null;
  status?: MaintenanceStatus;
};

export function calculateMaintenanceStatus(item: MaintenanceSnapshot): MaintenanceStatus {
  if (item.status === "COMPLETED") {
    return MaintenanceStatus.COMPLETED;
  }

  let nextStatus: MaintenanceStatus = MaintenanceStatus.UPCOMING;

  if (item.dueDate) {
    const dayDiff = (item.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    if (dayDiff < 0) {
      nextStatus = MaintenanceStatus.OVERDUE;
    } else if (dayDiff <= 14) {
      nextStatus = MaintenanceStatus.DUE_SOON;
    }
  }

  if (item.dueMileage !== null && item.currentMileage !== null) {
    const milesRemaining = item.dueMileage - item.currentMileage;
    if (milesRemaining <= 0) {
      nextStatus = MaintenanceStatus.OVERDUE;
    } else if (milesRemaining <= 1000 && nextStatus !== MaintenanceStatus.OVERDUE) {
      nextStatus = MaintenanceStatus.DUE_SOON;
    }
  }

  return nextStatus;
}

export async function syncMaintenanceStatuses(client: PrismaClient = prisma) {
  const items = await client.maintenanceItem.findMany({
    where: { status: { not: "COMPLETED" } },
    select: { id: true, dueDate: true, dueMileage: true, currentMileage: true, status: true },
  });

  await Promise.all(
    items.map(async (item) => {
      const status = calculateMaintenanceStatus(item);
      if (status !== item.status) {
        await client.maintenanceItem.update({ where: { id: item.id }, data: { status } });
      }
    }),
  );
}

export async function applyCurrentMileageToOpenMaintenance(currentMileage: number, client: PrismaClient = prisma) {
  const items = await client.maintenanceItem.findMany({
    where: { status: { not: "COMPLETED" } },
    select: { id: true, dueDate: true, dueMileage: true, currentMileage: true, status: true },
  });

  await Promise.all(
    items.map((item) =>
      client.maintenanceItem.update({
        where: { id: item.id },
        data: {
          currentMileage,
          status: calculateMaintenanceStatus({ ...item, currentMileage }),
        },
      }),
    ),
  );
}
