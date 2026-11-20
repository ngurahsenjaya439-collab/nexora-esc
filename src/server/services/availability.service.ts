import "server-only";

import { AvailabilityStatus } from "@prisma/client";

import type { CurrentUser } from "@/server/auth/session";
import { prisma } from "@/server/db/prisma";
import { writeAudit } from "@/server/services/audit.service";
import type { AvailabilityInput } from "@/server/validators/availability.schema";

export async function updateUserAvailability(
  targetUserId: string,
  input: AvailabilityInput,
  actor: CurrentUser,
): Promise<{ userId: string; availability: AvailabilityStatus }> {
  if (actor.role !== "MANAGER" && actor.id !== targetUserId) {
    throw new Error("Anda hanya dapat mengubah ketersediaan akun sendiri.");
  }

  return prisma.$transaction(async (tx) => {
    const target = await tx.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, name: true, role: true, isActive: true },
    });

    if (!target || !target.isActive) {
      throw new Error("Pengguna tidak ditemukan atau tidak aktif.");
    }

    if (target.role !== "ANALYST" && actor.id !== target.id) {
      throw new Error("Manager hanya dapat mengubah ketersediaan Analyst.");
    }

    await tx.user.update({
      where: { id: targetUserId },
      data: {
        availability: input.availability as AvailabilityStatus,
        availabilityNote: input.availabilityNote?.trim() || null,
        availabilityUpdatedAt: new Date(),
      },
    });

    await writeAudit(tx, {
      actorId: actor.id,
      action: "USER_AVAILABILITY_UPDATED",
      entityType: "User",
      entityId: targetUserId,
      metadata: {
        availability: input.availability,
        note: input.availabilityNote?.trim() || null,
        targetName: target.name,
      },
    });

    return {
      userId: targetUserId,
      availability: input.availability as AvailabilityStatus,
    };
  });
}
