import "server-only";

import {
  AttachmentKind,
  ResearchStatus,
  SubmissionStatus,
} from "@prisma/client";

import { isActiveAssignee } from "@/lib/research-workflow";
import type { CurrentUser } from "@/server/auth/session";
import { prisma } from "@/server/db/prisma";
import { writeAudit } from "@/server/services/audit.service";
import type { ResearchSubmissionInput } from "@/server/validators/submission.schema";

const SUBMITTABLE_STATUSES = new Set<ResearchStatus>([
  ResearchStatus.IN_PROGRESS,
  ResearchStatus.REVISION_NEEDED,
]);

export async function createResearchSubmission(
  topicId: string,
  input: ResearchSubmissionInput,
  actor: CurrentUser,
): Promise<{ topicId: string; submissionId: string; version: number }> {
  if (actor.role !== "ANALYST") {
    throw new Error("Hanya Analyst yang dapat mengirimkan hasil riset.");
  }

  return prisma.$transaction(async (tx) => {
    const topic = await tx.researchTopic.findUnique({
      where: { id: topicId },
      include: {
        assignments: { where: { isActive: true } },
        dodChecklist: {
          include: {
            items: {
              where: { isRequired: true, isChecked: false },
              orderBy: { sortOrder: "asc" },
            },
          },
        },
      },
    });

    if (!topic) {
      throw new Error("Topik riset tidak ditemukan.");
    }

    if (topic.archivedAt) {
      throw new Error("Topik yang diarsipkan tidak dapat menerima submission.");
    }

    if (!isActiveAssignee(topic.assignments, actor.id)) {
      throw new Error(
        "Anda bukan analyst aktif (Primary/Backup) pada topik ini sehingga tidak dapat mengirim hasil.",
      );
    }

    if (!SUBMITTABLE_STATUSES.has(topic.status)) {
      throw new Error(
        "Submission hanya dapat dikirim saat status In Progress atau Revision Needed.",
      );
    }

    const openRequired = topic.dodChecklist?.items ?? [];
    if (openRequired.length > 0) {
      throw new Error(
        `Checklist DOD wajib belum lengkap (${openRequired.length} item). Selesaikan checklist sebelum mengirim hasil riset.`,
      );
    }

    const latest = await tx.researchSubmission.aggregate({
      where: { topicId },
      _max: { version: true },
    });
    const version = (latest._max.version ?? 0) + 1;

    const submission = await tx.researchSubmission.create({
      data: {
        topicId,
        submittedById: actor.id,
        version,
        summary: input.summary,
        status: SubmissionStatus.PENDING_REVIEW,
        attachments: {
          create: [
            {
              kind: AttachmentKind.LINK,
              label: "Dokumen utama",
              url: input.documentUrl,
            },
            ...(input.attachments ?? []).map((attachment) => ({
              kind: AttachmentKind.LINK,
              label: attachment.label,
              url: attachment.url,
            })),
          ],
        },
      },
    });

    const updated = await tx.researchTopic.updateMany({
      where: {
        id: topicId,
        version: topic.version,
        status: topic.status,
        archivedAt: null,
      },
      data: {
        status: ResearchStatus.IN_REVIEW,
        completedAt: null,
        version: { increment: 1 },
      },
    });

    if (updated.count === 0) {
      throw new Error(
        "Topik telah diperbarui oleh pengguna lain. Muat ulang halaman lalu coba lagi.",
      );
    }

    await tx.researchStatusHistory.create({
      data: {
        topicId,
        fromStatus: topic.status,
        toStatus: ResearchStatus.IN_REVIEW,
        changedById: actor.id,
        note: `Hasil riset v${version} diajukan untuk review.`,
      },
    });

    await writeAudit(tx, {
      actorId: actor.id,
      action: "RESEARCH_SUBMITTED",
      entityType: "ResearchTopic",
      entityId: topicId,
      metadata: {
        submissionId: submission.id,
        version,
        attachmentCount: 1 + (input.attachments?.length ?? 0),
      },
    });

    return { topicId, submissionId: submission.id, version };
  });
}
