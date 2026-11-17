"use server";

import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";

import {
  fieldErrorsFromZod,
  type ActionState,
  type FieldErrors,
} from "@/lib/result";
import { requireUser } from "@/server/auth/session";
import { prisma } from "@/server/db/prisma";
import {
  archiveResearchTopic,
  createResearchTopic,
  updateResearchTopic,
} from "@/server/services/research.service";
import {
  researchTopicSchema,
  type ResearchTopicInput,
} from "@/server/validators/research.schema";

type ParseResult =
  | { ok: true; input: ResearchTopicInput }
  | { ok: false; state: ActionState };

function parseReferences(value: FormDataEntryValue | null):
  | { ok: true; references: unknown[] }
  | { ok: false; message: string } {
  if (typeof value !== "string" || !value.trim()) {
    return { ok: true, references: [] };
  }

  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) {
      return { ok: false, message: "Format referensi tidak valid." };
    }
    return { ok: true, references: parsed };
  } catch {
    return { ok: false, message: "Format referensi tidak valid." };
  }
}

async function validateRelations(
  primaryAnalystId: string | undefined,
  backupAnalystId: string | undefined,
  categoryIds: string[],
): Promise<{ message: string; fieldErrors: FieldErrors } | null> {
  const fieldErrors: FieldErrors = {};
  const analystIds = [primaryAnalystId, backupAnalystId].filter(
    (id): id is string => Boolean(id),
  );

  if (analystIds.length > 0) {
    const analysts = await prisma.user.findMany({
      where: {
        id: { in: analystIds },
        role: "ANALYST",
        isActive: true,
      },
      select: { id: true },
    });

    if (analysts.length !== new Set(analystIds).size) {
      const message = "Analyst yang dipilih tidak ditemukan atau tidak aktif.";
      if (primaryAnalystId) fieldErrors.primaryAnalystId = [message];
      if (backupAnalystId) fieldErrors.backupAnalystId = [message];
      return { message, fieldErrors };
    }
  }

  const categoryCount = await prisma.category.count({
    where: { id: { in: categoryIds }, isActive: true },
  });

  if (categoryCount !== new Set(categoryIds).size) {
    const message = "Kategori yang dipilih tidak valid.";
    fieldErrors.categoryIds = [message];
    return { message, fieldErrors };
  }

  return null;
}

async function parseAndValidate(formData: FormData): Promise<ParseResult> {
  const referencesResult = parseReferences(formData.get("referencesJson"));

  if (!referencesResult.ok) {
    return {
      ok: false,
      state: {
        ok: false,
        message: referencesResult.message,
        fieldErrors: { references: [referencesResult.message] },
      },
    };
  }

  const raw = {
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    objective: String(formData.get("objective") ?? ""),
    relevanceNote: String(formData.get("relevanceNote") ?? ""),
    status: String(formData.get("status") ?? "TO_DO"),
    priority: String(formData.get("priority") ?? "MEDIUM"),
    startDate: String(formData.get("startDate") ?? ""),
    deadline: String(formData.get("deadline") ?? ""),
    categoryIds: formData.getAll("categoryIds").map(String),
    primaryAnalystId: String(formData.get("primaryAnalystId") ?? ""),
    backupAnalystId: String(formData.get("backupAnalystId") ?? ""),
    references: referencesResult.references,
    version: formData.get("version") ? Number(formData.get("version")) : undefined,
  };

  const parsed = researchTopicSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      ok: false,
      state: {
        ok: false,
        message: "Periksa kembali isian formulir. Beberapa field belum valid.",
        fieldErrors: fieldErrorsFromZod(parsed.error),
      },
    };
  }

  const relationError = await validateRelations(
    parsed.data.primaryAnalystId,
    parsed.data.backupAnalystId,
    parsed.data.categoryIds,
  );

  if (relationError) {
    return {
      ok: false,
      state: {
        ok: false,
        message: relationError.message,
        fieldErrors: relationError.fieldErrors,
      },
    };
  }

  return { ok: true, input: parsed.data };
}

function toActionError(error: unknown): ActionState {
  if (error instanceof Error) {
    return { ok: false, message: error.message };
  }
  return {
    ok: false,
    message: "Terjadi kesalahan saat menyimpan data. Silakan coba lagi.",
  };
}

export async function createResearchTopicAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  if (user.role !== "MANAGER") {
    return {
      ok: false,
      message: "Hanya Manager yang dapat membuat topik riset.",
    };
  }

  const parsed = await parseAndValidate(formData);
  if (!parsed.ok) return parsed.state;

  try {
    const topic = await createResearchTopic(parsed.input, user);
    revalidatePath("/dashboard");
    revalidatePath("/research");
    redirect(`/research/${topic.id}?created=1`);
  } catch (error) {
    unstable_rethrow(error);
    return toActionError(error);
  }
}

export async function updateResearchTopicAction(
  topicId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  if (user.role !== "MANAGER") {
    return {
      ok: false,
      message: "Hanya Manager yang dapat mengubah topik riset.",
    };
  }

  const parsed = await parseAndValidate(formData);
  if (!parsed.ok) return parsed.state;

  try {
    await updateResearchTopic(topicId, parsed.input, user);
    revalidatePath("/dashboard");
    revalidatePath("/research");
    revalidatePath(`/research/${topicId}`);
    redirect(`/research/${topicId}?updated=1`);
  } catch (error) {
    unstable_rethrow(error);
    return toActionError(error);
  }
}

export async function archiveResearchTopicAction(topicId: string): Promise<void> {
  const user = await requireUser();

  if (user.role !== "MANAGER") {
    redirect("/dashboard?denied=1");
  }

  await archiveResearchTopic(topicId, user);
  revalidatePath("/dashboard");
  revalidatePath("/research");
  revalidatePath(`/research/${topicId}`);
  redirect("/research?archived=1");
}
