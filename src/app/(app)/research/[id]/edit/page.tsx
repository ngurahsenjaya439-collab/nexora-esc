import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { ResearchForm } from "@/components/research/research-form";
import { PageHeader } from "@/components/shared/page-header";
import { toDateInputValue } from "@/lib/dates";
import { requireManagerPage } from "@/server/auth/session";
import { updateResearchTopicAction } from "@/server/actions/research.actions";
import {
  getTopicById,
  listCategories,
} from "@/server/services/research.service";
import { listAnalystOptions } from "@/server/services/user.service";

export const metadata: Metadata = {
  title: "Edit Riset",
};

export default async function EditResearchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireManagerPage();
  const { id } = await params;

  const [topic, categories, analysts] = await Promise.all([
    getTopicById(id),
    listCategories(),
    listAnalystOptions(),
  ]);

  if (!topic) {
    notFound();
  }

  if (topic.archivedAt) {
    redirect(`/research/${topic.id}`);
  }

  const activeAssignments = topic.assignments.filter(
    (assignment) => assignment.isActive,
  );
  const primary = activeAssignments.find(
    (assignment) => assignment.role === "PRIMARY",
  );
  const backup = activeAssignments.find(
    (assignment) => assignment.role === "BACKUP",
  );

  return (
    <div className="space-y-5">
      <Link
        href={`/research/${topic.id}`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-900"
      >
        <ArrowLeft className="size-4" />
        Kembali ke detail riset
      </Link>

      <PageHeader
        eyebrow="US-01 · Manajemen topik"
        title="Edit Topik Riset"
        description={topic.title}
      />

      <ResearchForm
        action={updateResearchTopicAction.bind(null, topic.id)}
        mode="edit"
        cancelHref={`/research/${topic.id}`}
        categories={categories.map(({ id: categoryId, name, color }) => ({
          id: categoryId,
          name,
          color,
        }))}
        analysts={analysts.map((analyst) => ({
          id: analyst.id,
          name: analyst.name,
          availability: analyst.availability,
          availabilityNote: analyst.availabilityNote,
          activeTaskCount: analyst.activeTaskCount,
        }))}
        initial={{
          title: topic.title,
          description: topic.description,
          objective: topic.objective ?? "",
          relevanceNote: topic.relevanceNote ?? "",
          status: topic.status,
          priority: topic.priority,
          startDate: toDateInputValue(topic.startDate),
          deadline: toDateInputValue(topic.deadline),
          categoryIds: topic.categories.map((item) => item.categoryId),
          primaryAnalystId: primary?.userId ?? "",
          backupAnalystId: backup?.userId ?? "",
          references: topic.references.map((reference) => ({
            title: reference.title,
            url: reference.url,
            sourceType: reference.sourceType,
          })),
        }}
      />
    </div>
  );
}
