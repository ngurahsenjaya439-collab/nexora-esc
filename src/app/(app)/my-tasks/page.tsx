import type { Metadata } from "next";
import Link from "next/link";
import {
  CalendarClock,
  CircleDot,
  FlaskConical,
  ListChecks,
  RotateCcw,
  SearchX,
} from "lucide-react";

import { MyTaskFilters } from "@/components/research/my-task-filters";
import { MyTaskList } from "@/components/research/my-task-list";
import { EmptyState } from "@/components/shared/empty-state";
import { FlashMessage } from "@/components/shared/flash-message";
import { MetricCard } from "@/components/shared/metric-card";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { buttonClasses } from "@/components/ui/button";
import { requireAnalystPage } from "@/server/auth/session";
import { listMyTasks } from "@/server/services/research.service";

export const metadata: Metadata = {
  title: "Tugas Saya",
};

function asString(value: string | string[] | undefined): string {
  return typeof value === "string" ? value : "";
}

export default async function MyTasksPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireAnalystPage();
  const params = await searchParams;

  const q = asString(params.q);
  const status = asString(params.status);
  const due = asString(params.due);
  const role = asString(params.role);
  const page = Math.max(1, Number(asString(params.page)) || 1);

  const result = await listMyTasks(user.id, {
    q,
    status,
    due,
    role,
    page,
    pageSize: 8,
  });

  const hasFilters = Boolean(q || status || due || role);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="US-04 · Workspace Analyst"
        title="Tugas Saya"
        description="Pantau seluruh riset yang ditugaskan kepada Anda sebagai Primary maupun Backup Analyst."
        actions={
          <Link
            href="/research"
            className={buttonClasses({ variant: "secondary", size: "md" })}
          >
            <FlaskConical className="size-4" />
            Semua Riset
          </Link>
        }
      />

      {result.summary.overdue > 0 ? (
        <FlashMessage
          tone="error"
          message={`${result.summary.overdue} tugas sudah melewati deadline. Prioritaskan penyelesaian atau koordinasi dengan Manager.`}
        />
      ) : result.summary.revisionNeeded > 0 ? (
        <FlashMessage
          tone="info"
          message={`${result.summary.revisionNeeded} tugas memerlukan revisi. Buka detail riset untuk melihat catatan Manager.`}
        />
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total Tugas"
          value={result.summary.total}
          hint={`${result.summary.overdue} overdue · ${result.summary.approaching} mendekati deadline`}
          icon={ListChecks}
          tone="indigo"
        />
        <MetricCard
          label="In Progress"
          value={result.summary.inProgress}
          hint={`${result.summary.todo} belum dimulai`}
          icon={CircleDot}
          tone="blue"
        />
        <MetricCard
          label="Menunggu Review"
          value={result.summary.inReview}
          hint="Sudah disubmit ke Manager"
          icon={CalendarClock}
          tone="amber"
        />
        <MetricCard
          label="Perlu Revisi"
          value={result.summary.revisionNeeded}
          hint={`${result.summary.done} tugas selesai`}
          icon={RotateCcw}
          tone="rose"
        />
      </section>

      <MyTaskFilters defaults={{ q, status, due, role }} />

      {result.tasks.length === 0 ? (
        <EmptyState
          icon={hasFilters ? SearchX : ListChecks}
          title={
            hasFilters ? "Tidak ada tugas yang cocok" : "Belum ada tugas aktif"
          }
          description={
            hasFilters
              ? "Coba ubah kata kunci atau reset filter untuk melihat seluruh tugas Anda."
              : "Saat ini belum ada riset yang ditugaskan kepada Anda. Hubungi Manager untuk penugasan baru."
          }
          action={
            hasFilters ? (
              <Link href="/my-tasks" className={buttonClasses({ variant: "secondary" })}>
                Reset filter
              </Link>
            ) : undefined
          }
        />
      ) : (
        <>
          <MyTaskList tasks={result.tasks} userId={user.id} />
          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            total={result.total}
            basePath="/my-tasks"
            searchParams={params}
          />
        </>
      )}
    </div>
  );
}
