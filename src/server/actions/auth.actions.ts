"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getSession } from "@/lib/session";
import { prisma } from "@/server/db/prisma";

function safeRedirect(value: FormDataEntryValue | null): string {
  const path = typeof value === "string" ? value : "/dashboard";
  if (!path.startsWith("/") || path.startsWith("//")) return "/dashboard";
  return path;
}

export async function quickLogin(formData: FormData) {
  const userId = String(formData.get("userId") ?? "");
  const user = await prisma.user.findFirst({
    where: { id: userId, isActive: true },
    select: { id: true },
  });

  if (!user) {
    redirect("/login?error=user-not-found");
  }

  const session = await getSession();
  session.userId = user.id;
  await session.save();

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  revalidatePath("/", "layout");
  redirect(safeRedirect(formData.get("redirectTo")));
}

export async function switchUser(formData: FormData) {
  await quickLogin(formData);
}

export async function logout() {
  const session = await getSession();
  session.destroy();
  revalidatePath("/", "layout");
  redirect("/login");
}
