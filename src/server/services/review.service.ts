import "server-only";

import {
  ResearchStatus,
  ReviewDecision,
  RevisionSeverity,
  RevisionStatus,
  SubmissionStatus,
} from "@prisma/client";

import type { CurrentUser } from "@/server/auth/session";
import { prisma } from "@/server/db/prisma";
import { writeAudit } from "@/server/services/audit.service";
import type { ResearchReviewInput } from "@/server/validators/review.schema";

export async function submitResearchReview(
  topicId: string,
  submissionId: string,
  input: ResearchReviewInput,
  actor: CurrentUser,
): Promise<{ topicId: string; reviewId: string; decision: ReviewDecision }> {
  if (actor.role !== "MANAGER") {
    throw new Error("Hanya Manager yang dapat melakukan review.");
  }

  return prisma.$transaction(async (tx) => {
    const submission = await tx.researchSubmission.findUnique({
      where: { id: submissionId },
      include: {
        topic: {
          include: {
            dodChecklist: {
              include: {
                items: {
                  where: { isRequired: true, isChecked: false },
                  orderBy: { sortOrder: "asc" },
                },
              },
            },
          },
        },
      },
    });

    if (!submission || submission.topicId !== topicId) {
      throw new Error("Submission tidak ditemukan pada topik ini.");
    }

    const topic = submission.topic;

    if (topic.archivedAt || topic.status === "ARCHIVED") {
      throw new Error("Topik yang diarsipkan tidak dapat direview.");
    }

    if (topic.status !== ResearchStatus.IN_REVIEW) {
      throw new Error(
        "Review hanya dapat dilakukan saat topik berstatus In Review.",
      );
    }

    if (submission.status !== SubmissionStatus.PENDING_REVIEW) {
      throw new Error("Submission ini sudah pernah direview.");
    }

    if (input.decision === "APPROVED") {
      const openRequired = topic.dodChecklist?.items ?? [];
      if (openRequired.length > 0) {
        throw new Error(
          `Verifikasi checklist DOD terlebih dahulu. Masih ada ${openRequired.length} item wajib yang belum dicentang.`,
        );
      }
    }

    const decision =
      input.decision === "APPROVED"
        ? ReviewDecision.APPROVED
        : ReviewDecision.REVISION_REQUESTED;

    const review = await tx.researchReview.create({
      data: {
        submissionId,
        reviewerId: actor.id,
        decision,
        summary: input.summary?.trim() || null,
      },
    });

    if (input.decision === "REVISION_REQUESTED") {
      await tx.revisionNote.createMany({
        data: input.revisionNotes.map((note) => ({
          topicId,
          submissionId,
          reviewId: review.id,
          authorId: actor.id,
          section: note.section,
          note: note.note,
          severity: note.severity as RevisionSeverity,
          status: RevisionStatus.OPEN,
        })),
      });
    }

    const nextSubmissionStatus =
      input.decision === "APPROVED"
        ? SubmissionStatus.APPROVED
        : SubmissionStatus.REVISION_REQUESTED;

    const nextTopicStatus =
      input.decision === "APPROVED"
        ? ResearchStatus.DONE
        : ResearchStatus.REVISION_NEEDED;

    await tx.researchSubmission.update({
      where: { id: submissionId },
      data: {
        status: nextSubmissionStatus,
        reviewedById: actor.id,
        reviewedAt: new Date(),
      },
    });

    const updated = await tx.researchTopic.updateMany({
      where: {
        id: topicId,
        version: topic.version,
        status: ResearchStatus.IN_REVIEW,
        archivedAt: null,
      },
      data: {
        status: nextTopicStatus,
        completedAt:
          input.decision === "APPROVED" ? new Date() : null,
        version: { increment: 1 },
      },
    });

    if (updated.count === 0) {
      throw new Error(
        "Topik telah diperbarui oleh pengguna lain. Muat ulang halaman lalu coba lagi.",
      );
    }

    const historyNote =
      input.decision === "APPROVED"
        ? `Riset v${submission.version} disetujui Manager.`
        : `Revisi diminta Manager untuk riset v${submission.version} (${input.revisionNotes.length} catatan).`;

    await tx.researchStatusHistory.create({
      data: {
        topicId,
        fromStatus: ResearchStatus.IN_REVIEW,
        toStatus: nextTopicStatus,
        changedById: actor.id,
        note: historyNote,
      },
    });

    await writeAudit(tx, {
      actorId: actor.id,
      action:
        input.decision === "APPROVED"
          ? "RESEARCH_REVIEW_APPROVED"
          : "RESEARCH_REVISION_REQUESTED",
      entityType: "ResearchTopic",
      entityId: topicId,
      metadata: {
        submissionId,
        submissionVersion: submission.version,
        reviewId: review.id,
        decision: input.decision,
        revisionNoteCount:
          input.decision === "REVISION_REQUESTED"
            ? input.revisionNotes.length
            : 0,
      },
    });

    return { topicId, reviewId: review.id, decision };
  });
}
