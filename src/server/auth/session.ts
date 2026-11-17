import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { prisma } from "@/server/db/prisma";
import { getSession } from "@/lib/session";

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: "MANAGER" | "ANALYST";
  avatarUrl: string | null;
  availability: "AVAILABLE" | "BUSY_EXAM" | "UNAVAILABLE";
  availabilityNote: string | null;
  departmentId: string | null;
};

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const session = await getSession();
  if (!session.userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatarUrl: true,
      availability: true,
      availabilityNote: true,
      departmentId: true,
      isActive: true,
    },
  });

  if (!user?.isActive) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatarUrl: user.avatarUrl,
    availability: user.availability,
    availabilityNote: user.availabilityNote,
    departmentId: user.departmentId,
  };
});

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireManagerPage(): Promise<CurrentUser> {
  const user = await requireUser();
  if (user.role !== "MANAGER") redirect("/dashboard?denied=1");
  return user;
}
