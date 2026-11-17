import "server-only";

import { Prisma, ResearchStatus } from "@prisma/client";

import { ACTIVE_STATUS_VALUES, RESEARCH_STATUS_VALUES } from "@/lib/constants";
import { daysUntilDeadline } from "@/lib/dates";
import type { CurrentUser } from "@/server/auth/session";
import { prisma } from "@/server/db/prisma";
import type { ResearchTopicInput } from "@/server/validators/research.schema";
import { writeAudit } from "@/server/services/audit.service";

export const topicListInclude = {
  categories: {
    include: { category: true },
    orderBy: { category: { name: "asc" } },
  },
  assignments: {
    where: { isActive: true },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          availability: true,
        },
      },
    },
    orderBy: { assignedAt: "asc" },
  },
} satisfies Prisma.ResearchTopicInclude;

export type TopicListItem = Prisma.ResearchTopicGetPayload<{
  include: typeof topicListInclude;
}>;

export const topicDetailInclude = {
  department: true,
  createdBy: {
    select: { id: true, name: true, email: true, role: true },
  },
  backupAnalyst: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      availability: true,
      availabilityNote: true,
    },
  },
  categories: {
    include: { category: true },
    orderBy: { category: { name: "asc" } },
  },
  assignments: {
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          availability: true,
          availabilityNote: true,
        },
      },
      assignedBy: { select: { id: true, name: true } },
    },
    orderBy: { assignedAt: "asc" },
  },
  references: {
    orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
  },
  statusHistory: {
    include: { changedBy: { select: { id: true, name: true, role: true } } },
    orderBy: { createdAt: "desc" },
  },
  dodChecklist: {
    include: { items: { orderBy: { sortOrder: "asc" } } },
  },
} satisfies Prisma.ResearchTopicInclude;

export type TopicDetail = Prisma.ResearchTopicGetPayload<{
  include: typeof topicDetailInclude;
}>;

const dashboardTopicSelect = {
  id: true,
  title: true,
  status: true,
  priority: true,
  startDate: true,
  deadline: true,
  createdAt: true,
  categories: {
    select: {
      category: { select: { id: true, name: true, color: true } },
    },
  },
  assignments: {
    where: { isActive: true, role: { in: ["PRIMARY", "COLLABORATOR"] } },
    select: {
      userId: true,
      user: {
        select: {
          id: true,
          name: true,
          availability: true,
        },
      },
    },
  },
} satisfies Prisma.ResearchTopicSelect;

export type DashboardTopic = Prisma.ResearchTopicGetPayload<{
  select: typeof dashboardTopicSelect;
}>;

export type DashboardTopicWithDays = DashboardTopic & { days: number };

function startOfToday(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

export async function listTopics(params: {
  q?: string;
  status?: string;
  categoryId?: string;
  analystId?: string;
  due?: string;
  page?: number;
  pageSize?: number;
}) {
  const pageSize = Math.min(Math.max(params.pageSize ?? 8, 1), 50);
  const page = Math.max(params.page ?? 1, 1);
  const and: Prisma.ResearchTopicWhereInput[] = [{ archivedAt: null }];

  const q = params.q?.trim();
  if (q) {
    and.push({
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { relevanceNote: { contains: q, mode: "insensitive" } },
      ],
    });
  }

  if (
    params.status &&
    RESEARCH_STATUS_VALUES.includes(
      params.status as (typeof RESEARCH_STATUS_VALUES)[number],
    )
  ) {
    and.push({ status: params.status as ResearchStatus });
  }

  if (params.categoryId) {
    and.push({ categories: { some: { categoryId: params.categoryId } } });
  }

  if (params.analystId) {
    and.push({
      assignments: {
        some: {
          userId: params.analystId,
          isActive: true,
          role: { in: ["PRIMARY", "COLLABORATOR"] },
        },
      },
    });
  }

  if (params.due) {
    const today = startOfToday();
    const soon = addDays(today, 4);

    if (params.due === "overdue") {
      and.push({
        deadline: { lt: today },
        status: { notIn: ["DONE", "ARCHIVED"] },
      });
    } else if (params.due === "approaching") {
      and.push({
        deadline: { gte: today, lt: soon },
        status: { notIn: ["DONE", "ARCHIVED"] },
      });
    } else if (params.due === "attention") {
      and.push({
        status: { notIn: ["DONE", "ARCHIVED"] },
        OR: [
          { deadline: { lt: soon } },
          { assignments: { none: { isActive: true, role: "PRIMARY" } } },
        ],
      });
    }
  }

  const where: Prisma.ResearchTopicWhereInput = { AND: and };

  const [total, topics] = await prisma.$transaction([
    prisma.researchTopic.count({ where }),
    prisma.researchTopic.findMany({
      where,
      include: topicListInclude,
      orderBy: [{ deadline: "asc" }, { createdAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return {
    topics,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getTopicById(id: string): Promise<TopicDetail | null> {
  return prisma.researchTopic.findUnique({
    where: { id },
    include: topicDetailInclude,
  });
}

export async function listCategories() {
  return prisma.category.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true, color: true },
  });
}

export async function getDashboardData(user: CurrentUser) {
  const topics = await prisma.researchTopic.findMany({
    where: { archivedAt: null },
    select: dashboardTopicSelect,
    orderBy: [{ deadline: "asc" }],
  });

  const withDays: DashboardTopicWithDays[] = topics.map((topic) => ({
    ...topic,
    days: daysUntilDeadline(topic.deadline),
  }));

  const activeStatuses = new Set<string>(ACTIVE_STATUS_VALUES);
  const active = withDays.filter((topic) => activeStatuses.has(topic.status));
  const completed = withDays.filter((topic) => topic.status === "DONE");
  const approaching = withDays.filter(
    (topic) => topic.status !== "DONE" && topic.days >= 0 && topic.days <= 3,
  );
  const overdue = withDays.filter(
    (topic) => topic.status !== "DONE" && topic.days < 0,
  );
  const unassigned = withDays.filter(
    (topic) => topic.status !== "DONE" && topic.assignments.length === 0,
  );

  const myTasks =
    user.role === "ANALYST"
      ? withDays.filter(
          (topic) =>
            topic.status !== "DONE" &&
            topic.assignments.some((assignment) => assignment.userId === user.id),
        )
      : [];

  const attentionMap = new Map<string, DashboardTopicWithDays>();
  for (const topic of [...overdue, ...approaching, ...unassigned]) {
    if (!attentionMap.has(topic.id)) attentionMap.set(topic.id, topic);
  }

  const recent = [...withDays]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);

  const analysts =
    user.role === "MANAGER"
      ? await prisma.user.findMany({
          where: { role: "ANALYST", isActive: true },
          select: {
            id: true,
            name: true,
            availability: true,
            availabilityNote: true,
            assignments: {
              where: {
                isActive: true,
                role: "PRIMARY",
                topic: {
                  archivedAt: null,
                  status: { notIn: ["DONE", "ARCHIVED"] },
                },
              },
              select: { id: true },
            },
          },
          orderBy: { name: "asc" },
        })
      : [];

  return {
    metrics: {
      total: withDays.length,
      active: active.length,
      approaching: approaching.length,
      completed: completed.length,
      overdue: overdue.length,
      unassigned: unassigned.length,
      completionRate:
        withDays.length > 0
          ? Math.round((completed.length / withDays.length) * 100)
          : 0,
    },
    myTasks: myTasks.slice(0, 6),
    attention: [...attentionMap.values()].slice(0, 6),
    workload: analysts.map((analyst) => ({
      id: analyst.id,
      name: analyst.name,
      availability: analyst.availability,
      availabilityNote: analyst.availabilityNote,
      activeTasks: analyst.assignments.length,
    })),
    recent,
  };
}

export async function createResearchTopic(
  input: ResearchTopicInput,
  actor: CurrentUser,
) {
  return prisma.$transaction(async (tx) => {
    const topic = await tx.researchTopic.create({
      data: {
        departmentId: actor.departmentId,
        title: input.title,
        description: input.description,
        objective: input.objective || null,
        relevanceNote: input.relevanceNote || null,
        status: input.status as ResearchStatus,
        priority: input.priority,
        startDate: new Date(`${input.startDate}T00:00:00.000Z`),
        deadline: new Date(`${input.deadline}T00:00:00.000Z`),
        createdById: actor.id,
        backupAnalystId: input.backupAnalystId ?? null,
        completedAt: input.status === "DONE" ? new Date() : null,
      },
    });

    await tx.researchTopicCategory.createMany({
      data: input.categoryIds.map((categoryId) => ({
        topicId: topic.id,
        categoryId,
      })),
    });

    if (input.primaryAnalystId) {
      await tx.researchAssignment.create({
        data: {
          topicId: topic.id,
          userId: input.primaryAnalystId,
          role: "PRIMARY",
          assignedById: actor.id,
          note: "Analyst utama ditetapkan saat pembuatan topik.",
        },
      });
    }

    if (input.backupAnalystId) {
      await tx.researchAssignment.create({
        data: {
          topicId: topic.id,
          userId: input.backupAnalystId,
          role: "BACKUP",
          assignedById: actor.id,
          note: "Backup analyst ditetapkan saat pembuatan topik.",
        },
      });
    }

    if (input.references?.length) {
      await tx.researchReference.createMany({
        data: input.references.map((reference) => ({
          topicId: topic.id,
          addedById: actor.id,
          title: reference.title,
          url: reference.url,
          sourceType: reference.sourceType,
        })),
      });
    }

    await tx.researchStatusHistory.create({
      data: {
        topicId: topic.id,
        fromStatus: null,
        toStatus: input.status as ResearchStatus,
        changedById: actor.id,
        note: "Topik riset dibuat.",
      },
    });

    await writeAudit(tx, {
      actorId: actor.id,
      action: "RESEARCH_TOPIC_CREATED",
      entityType: "ResearchTopic",
      entityId: topic.id,
      metadata: {
        title: input.title,
        status: input.status,
        priority: input.priority,
      },
    });

    return topic;
  });
}

export async function updateResearchTopic(
  topicId: string,
  input: ResearchTopicInput,
  actor: CurrentUser,
) {
  return prisma.$transaction(async (tx) => {
    const current = await tx.researchTopic.findUnique({
      where: { id: topicId },
      include: {
        assignments: { where: { isActive: true } },
      },
    });

    if (!current) {
      throw new Error("Topik riset tidak ditemukan.");
    }

    if (current.archivedAt) {
      throw new Error("Topik riset sudah diarsipkan dan tidak dapat diubah.");
    }

    if (input.version && current.version !== input.version) {
      throw new Error(
        "Topik telah diperbarui oleh pengguna lain. Muat ulang halaman lalu coba lagi.",
      );
    }

    const currentPrimary =
      current.assignments.find((assignment) => assignment.role === "PRIMARY")
        ?.userId ?? null;
    const currentBackup =
      current.assignments.find((assignment) => assignment.role === "BACKUP")
        ?.userId ?? null;
    const nextPrimary = input.primaryAnalystId ?? null;
    const nextBackup = input.backupAnalystId ?? null;
    const assignmentChanged =
      currentPrimary !== nextPrimary || currentBackup !== nextBackup;

    const completedAt =
      input.status === "DONE" ? (current.completedAt ?? new Date()) : null;

    const topic = await tx.researchTopic.update({
      where: { id: topicId },
      data: {
        title: input.title,
        description: input.description,
        objective: input.objective || null,
        relevanceNote: input.relevanceNote || null,
        status: input.status as ResearchStatus,
        priority: input.priority,
        startDate: new Date(`${input.startDate}T00:00:00.000Z`),
        deadline: new Date(`${input.deadline}T00:00:00.000Z`),
        backupAnalystId: nextBackup,
        completedAt,
        version: { increment: 1 },
      },
    });

    await tx.researchTopicCategory.deleteMany({ where: { topicId } });
    await tx.researchTopicCategory.createMany({
      data: input.categoryIds.map((categoryId) => ({
        topicId,
        categoryId,
      })),
    });

    if (assignmentChanged) {
      await tx.researchAssignment.updateMany({
        where: {
          topicId,
          isActive: true,
          role: { in: ["PRIMARY", "BACKUP"] },
        },
        data: { isActive: false, unassignedAt: new Date() },
      });

      if (nextPrimary) {
        await tx.researchAssignment.create({
          data: {
            topicId,
            userId: nextPrimary,
            role: "PRIMARY",
            assignedById: actor.id,
            note: "Penugasan diperbarui melalui form edit.",
          },
        });
      }

      if (nextBackup) {
        await tx.researchAssignment.create({
          data: {
            topicId,
            userId: nextBackup,
            role: "BACKUP",
            assignedById: actor.id,
            note: "Backup analyst diperbarui melalui form edit.",
          },
        });
      }
    }

    await tx.researchReference.deleteMany({ where: { topicId } });
    if (input.references?.length) {
      await tx.researchReference.createMany({
        data: input.references.map((reference) => ({
          topicId,
          addedById: actor.id,
          title: reference.title,
          url: reference.url,
          sourceType: reference.sourceType,
        })),
      });
    }

    if (current.status !== input.status) {
      await tx.researchStatusHistory.create({
        data: {
          topicId,
          fromStatus: current.status,
          toStatus: input.status as ResearchStatus,
          changedById: actor.id,
          note: "Status diperbarui melalui form edit.",
        },
      });
    }

    await writeAudit(tx, {
      actorId: actor.id,
      action: "RESEARCH_TOPIC_UPDATED",
      entityType: "ResearchTopic",
      entityId: topicId,
      metadata: {
        title: input.title,
        status: input.status,
        assignmentChanged,
      },
    });

    return topic;
  });
}

export async function archiveResearchTopic(topicId: string, actor: CurrentUser) {
  return prisma.$transaction(async (tx) => {
    const current = await tx.researchTopic.findUnique({
      where: { id: topicId },
    });

    if (!current) {
      throw new Error("Topik riset tidak ditemukan.");
    }

    if (current.archivedAt) {
      return current;
    }

    const topic = await tx.researchTopic.update({
      where: { id: topicId },
      data: {
        archivedAt: new Date(),
        status: "ARCHIVED",
        version: { increment: 1 },
      },
    });

    await tx.researchAssignment.updateMany({
      where: { topicId, isActive: true },
      data: { isActive: false, unassignedAt: new Date() },
    });

    await tx.researchStatusHistory.create({
      data: {
        topicId,
        fromStatus: current.status,
        toStatus: "ARCHIVED",
        changedById: actor.id,
        note: "Topik diarsipkan.",
      },
    });

    await writeAudit(tx, {
      actorId: actor.id,
      action: "RESEARCH_TOPIC_ARCHIVED",
      entityType: "ResearchTopic",
      entityId: topicId,
      metadata: { title: current.title },
    });

    return topic;
  });
}
