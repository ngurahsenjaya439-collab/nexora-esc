"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";

import {
  fieldErrorsFromZod,
  type ActionState,
} from "@/lib/result";
import { requireUser } from "@/server/auth/session";
import { applyDodTemplate, changeResearchStatus, resolveRevisionNote, toggleDodItem } from "@/server/services/workflow.service";
import { createResearchSubmission } from "@/server/services/submission.service";
import { submitResearchReview } from "@/server/services/review.service";
import {
  dodToggleSchema,
  resolveRevisionNoteSchema,
  statusChangeSchema,
} from "@/server/validators/workflow.schema";
import { researchSubmissionSchema } from "@/server/validators/submission.schema";
import { researchReviewSchema } from "@/server/validators/review.schema";

function toActionError(error: unknown): ActionState {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return {
        ok: false,
        message:
          "Submission dengan versi yang sama sudah ada. Muat ulang halaman lalu coba lagi.",
      };
    }
  }

  if (error instanceof Error) {
    return { ok: false, message: error.message };
  }

  return {
    ok: false,
    message: "Terjadi kesalahan saat menyimpan data. Silakan coba lagi.",
  };
}

function revalidateTopic(topicId: string): void {
  revalidatePath("/dashboard");
  revalidatePath("/research");
  revalidatePath("/research", "layout");
  revalidatePath(`/research/${topicId}`);
  revalidatePath("/my-tasks");
  revalidatePath("/team");
}

function parseJsonArray(
  value: FormDataEntryValue | null,
  label: string,
): { ok: true; items: unknown[] } | { ok: false; message: string } {
  if (typeof value !== "string" || !value.trim()) {
    return { ok: true, items: [] };
  }

  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) {
      return { ok: false, message: `Format ${label} tidak valid.` };
    }
    return { ok: true, items: parsed };
  } catch {
    return { ok: false, message: `Format ${label} tidak valid.` };
  }
}

export async function changeStatusAction(
  topicId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const parsed = statusChangeSchema.safeParse({
    toStatus: String(formData.get("toStatus") ?? ""),
    note: String(formData.get("note") ?? ""),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Perubahan status tidak valid.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  try {
    await changeResearchStatus(topicId, parsed.data, user);
    revalidateTopic(topicId);
    redirect(`/research/${topicId}?status=updated`);
  } catch (error) {
    unstable_rethrow(error);
    return toActionError(error);
  }
}

export async function submitResearchAction(
  topicId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const attachmentsResult = parseJsonArray(
    formData.get("attachmentsJson"),
    "lampiran",
  );

  if (!attachmentsResult.ok) {
    return {
      ok: false,
      message: attachmentsResult.message,
      fieldErrors: { attachments: [attachmentsResult.message] },
    };
  }

  const parsed = researchSubmissionSchema.safeParse({
    summary: String(formData.get("summary") ?? ""),
    documentUrl: String(formData.get("documentUrl") ?? ""),
    attachments: attachmentsResult.items,
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Periksa kembali form submission. Beberapa field belum valid.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  try {
    await createResearchSubmission(topicId, parsed.data, user);
    revalidateTopic(topicId);
    redirect(`/research/${topicId}?submitted=1`);
  } catch (error) {
    unstable_rethrow(error);
    return toActionError(error);
  }
}

export async function submitReviewAction(
  topicId: string,
  submissionId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const decision = String(formData.get("decision") ?? "");
  const summary = String(formData.get("summary") ?? "");
  const notesResult = parseJsonArray(
    formData.get("revisionNotesJson"),
    "catatan revisi",
  );

  if (!notesResult.ok) {
    return {
      ok: false,
      message: notesResult.message,
      fieldErrors: { revisionNotes: [notesResult.message] },
    };
  }

  const raw =
    decision === "APPROVED"
      ? { decision, summary }
      : { decision, summary, revisionNotes: notesResult.items };

  const parsed = researchReviewSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      ok: false,
      message: "Periksa kembali keputusan review dan catatan revisi.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  try {
    await submitResearchReview(topicId, submissionId, parsed.data, user);
    revalidateTopic(topicId);
    redirect(
      `/research/${topicId}?review=${
        parsed.data.decision === "APPROVED" ? "approved" : "revision"
      }`,
    );
  } catch (error) {
    unstable_rethrow(error);
    return toActionError(error);
  }
}

export async function toggleDodItemAction(
  itemId: string,
  checked: boolean,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = dodToggleSchema.safeParse({ itemId, checked });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Item checklist tidak valid.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  try {
    const result = await toggleDodItem(
      parsed.data.itemId,
      parsed.data.checked,
      user,
    );
    revalidateTopic(result.topicId);
    return {
      ok: true,
      message: result.checked
        ? "Item checklist ditandai selesai."
        : "Item checklist dibuka kembali.",
    };
  } catch (error) {
    return toActionError(error);
  }
}

export async function applyDodTemplateAction(
  topicId: string,
): Promise<ActionState> {
  const user = await requireUser();

  try {
    const result = await applyDodTemplate(topicId, user);
    revalidateTopic(topicId);
    return {
      ok: true,
      message: `Checklist DOD diterapkan (${result.itemCount} item).`,
    };
  } catch (error) {
    return toActionError(error);
  }
}

export async function resolveRevisionNoteAction(
  noteId: string,
  resolved: boolean,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = resolveRevisionNoteSchema.safeParse({ noteId, resolved });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Catatan revisi tidak valid.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  try {
    const result = await resolveRevisionNote(
      parsed.data.noteId,
      parsed.data.resolved,
      user,
    );
    revalidateTopic(result.topicId);
    return {
      ok: true,
      message: result.resolved
        ? "Catatan revisi ditandai selesai."
        : "Catatan revisi dibuka kembali.",
    };
  } catch (error) {
    return toActionError(error);
  }
}
