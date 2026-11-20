import "server-only";

import { prisma } from "@/server/db/prisma";
import { daysUntilDeadline } from "@/lib/dates";

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

export type TeamAnalyst = {
  id: string;
  name: string;
  email: string;
  availability: DemoUser["availability"];
  availabilityNote: string | null;
  availabilityUpdatedAt: Date | null;
  activeTaskCount: number;
  overdueTaskCount: number;
  revisionNeededCount: number;
  pendingReviewCount: number;
};

export async function listTeamOverview(): Promise<TeamAnalyst[]> {
  const analysts = await prisma.user.findMany({
    where: { role: "ANALYST", isActive: true },
    select: {
      id: true,
      name: true,
      email: true,
      availability: true,
      availabilityNote: true,
      availabilityUpdatedAt: true,
      assignments: {
        where: {
          isActive: true,
          role: { in: ["PRIMARY", "BACKUP"] },
          topic: { archivedAt: null },
        },
        select: {
          role: true,
          topic: {
            select: {
              id: true,
              status: true,
              deadline: true,
            },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return analysts.map((analyst) => {
    const openTasks = analyst.assignments.filter(
      (assignment) =>
        assignment.topic.status !== "DONE" &&
        assignment.topic.status !== "ARCHIVED",
    );

    return {
      id: analyst.id,
      name: analyst.name,
      email: analyst.email,
      availability: analyst.availability,
      availabilityNote: analyst.availabilityNote,
      availabilityUpdatedAt: analyst.availabilityUpdatedAt,
      activeTaskCount: openTasks.length,
      overdueTaskCount: openTasks.filter(
        (assignment) => daysUntilDeadline(assignment.topic.deadline) < 0,
      ).length,
      revisionNeededCount: openTasks.filter(
        (assignment) => assignment.topic.status === "REVISION_NEEDED",
      ).length,
      pendingReviewCount: openTasks.filter(
        (assignment) => assignment.topic.status === "IN_REVIEW",
      ).length,
    };
  });
}
