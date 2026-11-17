import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ResearchForm } from "@/components/research/research-form";
import { PageHeader } from "@/components/shared/page-header";
import { toDateInputValue } from "@/lib/dates";
import { requireManagerPage } from "@/server/auth/session";
import { createResearchTopicAction } from "@/server/actions/research.actions";
import { listCategories } from "@/server/services/research.service";
import { listAnalystOptions } from "@/server/services/user.service";

export const metadata: Metadata = {
  title: "Buat Riset",
};

export default async function NewResearchPage() {
  await requireManagerPage();

  const [categories, analysts] = await Promise.all([
    listCategories(),
    listAnalystOptions(),
  ]);

  const today = new Date();
  const deadline = new Date(today);
  deadline.setDate(deadline.getDate() + 14);

  return (
    <div className="space-y-5">
      <Link
        href="/research"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-900"
      >
        <ArrowLeft className="size-4" />
        Kembali ke daftar riset
      </Link>

      <PageHeader
        eyebrow="US-01 · Manajemen topik"
        title="Buat Topik Riset"
        description="Lengkapi informasi riset, tetapkan analyst, dan atur timeline pengerjaan."
      />

      <ResearchForm
        action={createResearchTopicAction}
        mode="create"
        cancelHref="/research"
        categories={categories.map(({ id, name, color }) => ({ id, name, color }))}
        analysts={analysts.map((analyst) => ({
          id: analyst.id,
          name: analyst.name,
          availability: analyst.availability,
          availabilityNote: analyst.availabilityNote,
          activeTaskCount: analyst.activeTaskCount,
        }))}
        initial={{
          title: "",
          description: "",
          objective: "",
          relevanceNote: "",
          status: "TO_DO",
          priority: "MEDIUM",
          startDate: toDateInputValue(today),
          deadline: toDateInputValue(deadline),
          categoryIds: [],
          primaryAnalystId: "",
          backupAnalystId: "",
          references: [],
        }}
      />
    </div>
  );
}
