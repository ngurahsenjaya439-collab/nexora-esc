"use server";

import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";

import { fieldErrorsFromZod, type ActionState } from "@/lib/result";
import { requireUser } from "@/server/auth/session";
import { updateUserAvailability } from "@/server/services/availability.service";
import { availabilitySchema } from "@/server/validators/availability.schema";

export async function updateAvailabilityAction(
  targetUserId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = availabilitySchema.safeParse({
    availability: String(formData.get("availability") ?? ""),
    availabilityNote: String(formData.get("availabilityNote") ?? ""),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Status ketersediaan belum valid.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  try {
    await updateUserAvailability(targetUserId, parsed.data, user);
    revalidatePath("/", "layout");
    revalidatePath("/dashboard");
    revalidatePath("/team");
    revalidatePath("/research");
    revalidatePath("/my-tasks");
    return {
      ok: true,
      message: "Ketersediaan berhasil diperbarui.",
    };
  } catch (error) {
    unstable_rethrow(error);
    if (error instanceof Error) {
      return { ok: false, message: error.message };
    }
    return {
      ok: false,
      message: "Gagal memperbarui ketersediaan. Silakan coba lagi.",
    };
  }
}
