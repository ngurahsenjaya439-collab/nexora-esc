import "server-only";

import { ResearchStatus, RevisionStatus } from "@prisma/client";

import {
  findStatusAction,
  isActiveAssignee,
  type WorkflowRole,
} from "@/lib/research-workflow";
import type { CurrentUser } from "@/server/auth/session";
import { prisma } from "@/server/db/prisma";
import { writeAudit } from "@/server/services/audit.service";
import type { StatusChangeInput } from "@/server/validators/workflow.schema";

function assertActorRole(actor: CurrentUser, role: WorkflowRole): void {
  if (actor.role !== role) {
    throw new Error(
      role === "MANAGER"
        ? "Aksi ini hanya dapat dilakukan oleh Manager."
        : "Aksi ini hanya dapat dilakukan oleh Analyst.",
    );
  }
}

export async function changeResearchStatus(
  topicId: string,
  input: StatusChangeInput,
  actor: CurrentUser,
): Promise<{ topicId: string; status: ResearchStatus }> {
  return prisma.$transaction(async (tx) => {
    const topic = await tx.researchTopic.findUnique({
      where: { id: topicId },
      include: { assignments: { where: { isActive: true } } },
    });

    if (!topic) {
      throw new Error("Topik riset tidak ditemukan.");
    }

    if (topic.archivedAt || topic.status === "ARCHIVED") {
      throw new Error("Topik riset yang diarsipkan tidak dapat diubah statusnya.");
    }

    const isAssigned = isActiveAssignee(topic.assignments, actor.id);
    if (actor.role === "ANALYST" && !isAssigned) {
      throw new Error(
        "Anda bukan analyst aktif pada topik ini sehingga tidak dapat mengubah status.",
      );
    }

    const action = findStatusAction(
      topic.status,
      input.toStatus,
      actor.role,
      isAssigned,
    );

    if (!action) {
      throw new Error(
        `Perubahan status dari ${topic.status} ke ${input.toStatus} tidak diizinkan untuk peran Anda.`,
      );
    }

    const note =
      input.note?.trim() || `${action.label}. ${action.description}`;

    const updated = await tx.researchTopic.updateMany({
      where: {
        id: topicId,
        version: topic.version,
        status: topic.status,
        archivedAt: null,
      },
      data: {
        status: input.toStatus as ResearchStatus,
        completedAt: null,
        version: { increment: 1 },
      },
    });

    if (updated.count === 0) {
      throw new Error(
        "Status topik telah berubah oleh pengguna lain. Muat ulang halaman lalu coba lagi.",
      );
    }

    await tx.researchStatusHistory.create({
      data: {
        topicId,
        fromStatus: topic.status,
        toStatus: input.toStatus as ResearchStatus,
        changedById: actor.id,
        note,
      },
    });

    await writeAudit(tx, {
      actorId: actor.id,
      action: "RESEARCH_STATUS_CHANGED",
      entityType: "ResearchTopic",
      entityId: topicId,
      metadata: {
        fromStatus: topic.status,
        toStatus: input.toStatus,
        note,
      },
    });

    return { topicId, status: input.toStatus as ResearchStatus };
  });
}

const ANALYST_DOD_STATUSES = new Set<ResearchStatus>([
  ResearchStatus.TO_DO,
  ResearchStatus.IN_PROGRESS,
  ResearchStatus.REVISION_NEEDED,
]);

export async function toggleDodItem(
  itemId: string,
  checked: boolean,
  actor: CurrentUser,
): Promise<{ topicId: string; checked: boolean }> {
  return prisma.$transaction(async (tx) => {
    const item = await tx.dodChecklistItem.findUnique({
      where: { id: itemId },
      include: {
        checklist: {
          include: {
            topic: {
              include: { assignments: { where: { isActive: true } } },
            },
          },
        },
      },
    });

    if (!item) {
      throw new Error("Item checklist DOD tidak ditemukan.");
    }

    const topic = item.checklist.topic;

    if (topic.archivedAt || topic.status === "ARCHIVED") {
      throw new Error("Checklist topik yang diarsipkan tidak dapat diubah.");
    }

    if (actor.role === "ANALYST") {
      const isAssigned = isActiveAssignee(topic.assignments, actor.id);
      if (!isAssigned) {
        throw new Error("Anda bukan analyst aktif pada topik ini.");
      }
      if (!ANALYST_DOD_STATUSES.has(topic.status)) {
        throw new Error(
          "Checklist DOD hanya dapat diubah Analyst saat pengerjaan atau revisi. Minta Manager memverifikasi saat review.",
        );
      }
    }

    await tx.dodChecklistItem.update({
      where: { id: itemId },
      data: checked
        ? {
            isChecked: true,
            checkedById: actor.id,
            checkedAt: new Date(),
          }
        : {
            isChecked: false,
            checkedById: null,
            checkedAt: null,
          },
    });

    await writeAudit(tx, {
      actorId: actor.id,
      action: checked ? "DOD_ITEM_CHECKED" : "DOD_ITEM_UNCHECKED",
      entityType: "ResearchTopic",
      entityId: topic.id,
      metadata: {
        itemId,
        label: item.label,
        required: item.isRequired,
      },
    });

    return { topicId: topic.id, checked };
  });
}

export async function applyDodTemplate(
  topicId: string,
  actor: CurrentUser,
): Promise<{ topicId: string; itemCount: number }> {
  assertActorRole(actor, "MANAGER");

  return prisma.$transaction(async (tx) => {
    const topic = await tx.researchTopic.findUnique({
      where: { id: topicId },
      include: {
        dodChecklist: { select: { id: true } },
      },
    });

    if (!topic) {
      throw new Error("Topik riset tidak ditemukan.");
    }

    if (topic.archivedAt) {
      throw new Error("Topik yang diarsipkan tidak dapat diterapkan checklist.");
    }

    if (topic.dodChecklist) {
      throw new Error("Topik ini sudah memiliki checklist DOD.");
    }

    const template = await tx.dodTemplate.findFirst({
      where: {
        isActive: true,
        OR: [{ departmentId: topic.departmentId }, { departmentId: null }],
      },
      orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
      include: { items: { orderBy: { sortOrder: "asc" } } },
    });

    if (!template || template.items.length === 0) {
      throw new Error(
        "Template checklist DOD aktif belum tersedia. Hubungi Manager untuk menyiapkan template.",
      );
    }

    const checklist = await tx.dodChecklist.create({
      data: {
        topicId,
        templateId: template.id,
        appliedById: actor.id,
      },
    });

    await tx.dodChecklistItem.createMany({
      data: template.items.map((item) => ({
        checklistId: checklist.id,
        templateItemId: item.id,
        label: item.label,
        description: item.description,
        isRequired: item.isRequired,
        sortOrder: item.sortOrder,
      })),
    });

    await writeAudit(tx, {
      actorId: actor.id,
      action: "DOD_CHECKLIST_APPLIED",
      entityType: "ResearchTopic",
      entityId: topicId,
      metadata: {
        templateId: template.id,
        templateName: template.name,
        itemCount: template.items.length,
      },
    });

    return { topicId, itemCount: template.items.length };
  });
}

export async function resolveRevisionNote(
  noteId: string,
  resolved: boolean,
  actor: CurrentUser,
): Promise<{ topicId: string; resolved: boolean }> {
  return prisma.$transaction(async (tx) => {
    const note = await tx.revisionNote.findUnique({
      where: { id: noteId },
      include: {
        topic: {
          include: { assignments: { where: { isActive: true } } },
        },
      },
    });

    if (!note) {
      throw new Error("Catatan revisi tidak ditemukan.");
    }

    if (note.topic.archivedAt) {
      throw new Error("Catatan revisi pada topik arsip tidak dapat diubah.");
    }

    if (actor.role === "ANALYST") {
      const isAssigned = isActiveAssignee(note.topic.assignments, actor.id);
      if (!isAssigned) {
        throw new Error("Anda bukan analyst aktif pada topik ini.");
      }
    }

    await tx.revisionNote.update({
      where: { id: noteId },
      data: resolved
        ? {
            status: RevisionStatus.RESOLVED,
            resolvedById: actor.id,
            resolvedAt: new Date(),
          }
        : {
            status: RevisionStatus.OPEN,
            resolvedById: null,
            resolvedAt: null,
          },
    });

    await writeAudit(tx, {
      actorId: actor.id,
      action: resolved ? "REVISION_NOTE_RESOLVED" : "REVISION_NOTE_REOPENED",
      entityType: "ResearchTopic",
      entityId: note.topicId,
      metadata: {
        noteId,
        section: note.section,
        severity: note.severity,
      },
    });

    return { topicId: note.topicId, resolved };
  });
}
