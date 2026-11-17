import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  CalendarClock,
  CheckCircle2,
  CircleDot,
  FlaskConical,
  ListChecks,
  Plus,
  TriangleAlert,
  Users,
} from "lucide-react";

import { Avatar } from "@/components/research/avatar";
import { CategoryChip } from "@/components/research/category-chip";
import { DeadlineBadge } from "@/components/research/deadline-badge";
import { PriorityBadge } from "@/components/research/priority-badge";
import { StatusBadge } from "@/components/research/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { FlashMessage } from "@/components/shared/flash-message";
import { MetricCard } from "@/components/shared/metric-card";
import { PageHeader } from "@/components/shared/page-header";
import { buttonClasses } from "@/components/ui/button";
import { AVAILABILITY_META, type AvailabilityValue } from "@/lib/constants";
import { formatDate } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { requireUser } from "@/server/auth/session";
import {
  getDashboardData,
  type DashboardTopicWithDays,
} from "@/server/services/research.service";

export const metadata: Metadata = {
  title: "Dashboard",
};

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 11) return "Selamat pagi";
  if (hour < 15) return "Selamat siang";
  if (hour < 19) return "Selamat sore";
  return "Selamat malam";
}

function DashboardTopicRow({
  topic,
  showDeadline = true,
}: {
  topic: DashboardTopicWithDays;
  showDeadline?: boolean;
}) {
  const primary = topic.assignments[0]?.user;

  return (
    <Link
      href={`/research/${topic.id}`}
      className="group flex flex-col gap-3 rounded-xl border border-transparent px-3 py-3 transition hover:border-slate-200 hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-medium text-slate-900 group-hover:text-indigo-700">
            {topic.title}
          </p>
          <StatusBadge status={topic.status} />
          <PriorityBadge priority={topic.priority} />
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <CalendarClock className="size-3.5 text-slate-400" />
            {formatDate(topic.deadline)}
          </span>
          {primary ? (
            <span className="inline-flex items-center gap-1.5">
              <Avatar name={primary.name} size="sm" className="size-5 text-[9px]" />
              {primary.name}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 font-medium text-amber-600">
              <TriangleAlert className="size-3.5" />
              Belum ada analyst
            </span>
          )}
          {topic.categories.slice(0, 1).map(({ category }) => (
            <CategoryChip key={category.id} name={category.name} color={category.color} />
          ))}
        </div>
      </div>
      {showDeadline ? (
        <div className="shrink-0">
          <DeadlineBadge deadline={topic.deadline} status={topic.status} />
        </div>
      ) : null}
    </Link>
  );
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const data = await getDashboardData(user);
  const isManager = user.role === "MANAGER";

  const flash =
    params.denied === "1"
      ? {
          tone: "error" as const,
          message: "Halaman tersebut hanya dapat diakses oleh Manager.",
        }
      : null;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={isManager ? "Manager workspace" : "Analyst workspace"}
        title={`${greeting()}, ${user.name.split(" ")[0]}`}
        description={
          isManager
            ? "Pantau portofolio riset, beban kerja analyst, dan topik yang perlu perhatian hari ini."
            : "Lihat tugas yang ditugaskan kepada Anda dan pantau sisa waktu setiap riset."
        }
        actions={
          isManager ? (
            <Link
              href="/research/new"
              className={buttonClasses({ variant: "accent", size: "md" })}
            >
              <Plus className="size-4" />
              Buat Riset
            </Link>
          ) : (
            <Link
              href="/research"
              className={buttonClasses({ variant: "secondary", size: "md" })}
            >
              <FlaskConical className="size-4" />
              Semua Riset
            </Link>
          )
        }
      />

      {flash ? <FlashMessage tone={flash.tone} message={flash.message} /> : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total Riset"
          value={data.metrics.total}
          hint="Tidak termasuk arsip"
          icon={FlaskConical}
          tone="indigo"
          href="/research"
        />
        <MetricCard
          label="Sedang Berjalan"
          value={data.metrics.active}
          hint="In progress, review, revisi"
          icon={CircleDot}
          tone="blue"
          href="/research?status=IN_PROGRESS"
        />
        <MetricCard
          label="Mendekati Deadline"
          value={data.metrics.approaching}
          hint={
            data.metrics.overdue > 0
              ? `${data.metrics.overdue} riset overdue`
              : "≤ 3 hari lagi"
          }
          icon={CalendarClock}
          tone="amber"
          href="/research?due=approaching"
        />
        <MetricCard
          label="Selesai"
          value={data.metrics.completed}
          hint={`${data.metrics.completionRate}% completion rate`}
          icon={CheckCircle2}
          tone="emerald"
          href="/research?status=DONE"
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          {!isManager ? (
            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div className="flex items-center gap-2">
                  <ListChecks className="size-4 text-indigo-500" />
                  <h2 className="text-sm font-semibold text-slate-900">Tugas Saya</h2>
                </div>
                <Link
                  href="/research"
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Lihat semua
                </Link>
              </div>
              <div className="p-2">
                {data.myTasks.length === 0 ? (
                  <EmptyState
                    icon={ListChecks}
                    title="Belum ada tugas aktif"
                    description="Saat ini tidak ada riset aktif yang ditugaskan kepada Anda."
                    className="border-0 bg-transparent py-10"
                  />
                ) : (
                  <div className="divide-y divide-slate-100">
                    {data.myTasks.map((topic) => (
                      <DashboardTopicRow key={topic.id} topic={topic} />
                    ))}
                  </div>
                )}
              </div>
            </section>
          ) : null}

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div className="flex items-center gap-2">
                <TriangleAlert className="size-4 text-amber-500" />
                <h2 className="text-sm font-semibold text-slate-900">
                  Perlu Perhatian
                </h2>
                {data.metrics.unassigned > 0 ? (
                  <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 ring-1 ring-inset ring-amber-200">
                    {data.metrics.unassigned} tanpa analyst
                  </span>
                ) : null}
              </div>
              <Link
                href="/research?due=attention"
                className="text-xs font-medium text-indigo-600 hover:text-indigo-500"
              >
                Lihat semua
              </Link>
            </div>
            <div className="p-2">
              {data.attention.length === 0 ? (
                <EmptyState
                  icon={CheckCircle2}
                  title="Semua terkendali"
                  description="Tidak ada riset overdue, mendekati deadline, atau tanpa analyst."
                  className="border-0 bg-transparent py-10"
                />
              ) : (
                <div className="divide-y divide-slate-100">
                  {data.attention.map((topic) => (
                    <DashboardTopicRow key={topic.id} topic={topic} />
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div className="flex items-center gap-2">
                <FlaskConical className="size-4 text-slate-400" />
                <h2 className="text-sm font-semibold text-slate-900">
                  Riset Terbaru
                </h2>
              </div>
              <Link
                href="/research"
                className="text-xs font-medium text-indigo-600 hover:text-indigo-500"
              >
                Semua riset
              </Link>
            </div>
            <div className="divide-y divide-slate-100 p-2">
              {data.recent.map((topic) => (
                <DashboardTopicRow key={topic.id} topic={topic} />
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          {isManager ? (
            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
                <Users className="size-4 text-indigo-500" />
                <h2 className="text-sm font-semibold text-slate-900">
                  Beban Kerja Analyst
                </h2>
              </div>
              <ul className="divide-y divide-slate-100">
                {data.workload.map((analyst) => {
                  const availability =
                    AVAILABILITY_META[analyst.availability as AvailabilityValue];
                  return (
                    <li
                      key={analyst.id}
                      className="flex items-center gap-3 px-5 py-3"
                    >
                      <Avatar name={analyst.name} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-800">
                          {analyst.name}
                        </p>
                        <p className="flex items-center gap-1.5 text-[11px] text-slate-500">
                          <span
                            className={cn("size-1.5 rounded-full", availability.dot)}
                          />
                          {availability.label}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "inline-flex min-w-8 items-center justify-center rounded-lg px-2 py-1 text-xs font-semibold ring-1 ring-inset",
                          analyst.activeTasks === 0
                            ? "bg-slate-50 text-slate-500 ring-slate-200"
                            : analyst.activeTasks >= 3
                              ? "bg-rose-50 text-rose-700 ring-rose-200"
                              : "bg-indigo-50 text-indigo-700 ring-indigo-200",
                        )}
                        title="Riset aktif sebagai analyst utama"
                      >
                        {analyst.activeTasks}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}

          <section className="overflow-hidden rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-600 to-indigo-500 p-5 text-white shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-indigo-100">
              Ringkasan Sprint 1
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">
              {data.metrics.completionRate}%
            </p>
            <p className="mt-1 text-sm text-indigo-100">
              {data.metrics.completed} dari {data.metrics.total} riset selesai.
            </p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-white"
                style={{ width: `${data.metrics.completionRate}%` }}
              />
            </div>
            <Link
              href="/research?status=DONE"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-white/90 hover:text-white"
            >
              Lihat riset selesai
              <ArrowUpRight className="size-3.5" />
            </Link>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">
              Cara kerja Sprint 1
            </h2>
            <ol className="mt-3 space-y-3 text-xs leading-5 text-slate-500">
              <li className="flex gap-2.5">
                <span className="grid size-5 shrink-0 place-items-center rounded-full bg-indigo-50 text-[10px] font-semibold text-indigo-600">
                  1
                </span>
                Manager membuat topik riset beserta relevansi isu dan referensi awal.
              </li>
              <li className="flex gap-2.5">
                <span className="grid size-5 shrink-0 place-items-center rounded-full bg-indigo-50 text-[10px] font-semibold text-indigo-600">
                  2
                </span>
                Tetapkan analyst utama dan backup agar antisipasi ketersediaan.
              </li>
              <li className="flex gap-2.5">
                <span className="grid size-5 shrink-0 place-items-center rounded-full bg-indigo-50 text-[10px] font-semibold text-indigo-600">
                  3
                </span>
                Pantau indikator On Track, Approaching, dan Overdue di setiap riset.
              </li>
            </ol>
          </section>
        </div>
      </div>
    </div>
  );
}
