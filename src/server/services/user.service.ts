import "server-only";

import { prisma } from "@/server/db/prisma";

export type DemoUser = {
  id: string;
  name: string;
  email: string;
  role: "MANAGER" | "ANALYST";
  availability: "AVAILABLE" | "BUSY_EXAM" | "UNAVAILABLE";
  availabilityNote: string | null;
};

export type AnalystOption = DemoUser & {
  activeTaskCount: number;
};

export async function listDemoUsers(): Promise<DemoUser[]> {
  return prisma.user.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      availability: true,
      availabilityNote: true,
    },
    orderBy: [{ role: "asc" }, { name: "asc" }],
  });
}

export async function listSwitchUsers(): Promise<DemoUser[]> {
  return listDemoUsers();
}

export async function listAnalystOptions(): Promise<AnalystOption[]> {
  const analysts = await prisma.user.findMany({
    where: { role: "ANALYST", isActive: true },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      availability: true,
      availabilityNote: true,
      assignments: {
        where: {
          isActive: true,
          role: { in: ["PRIMARY", "COLLABORATOR"] },
          topic: {
            archivedAt: null,
            status: { notIn: ["DONE", "ARCHIVED"] },
          },
        },
        select: { id: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return analysts.map((analyst) => ({
    id: analyst.id,
    name: analyst.name,
    email: analyst.email,
    role: analyst.role,
    availability: analyst.availability,
    availabilityNote: analyst.availabilityNote,
    activeTaskCount: analyst.assignments.length,
  }));
}
