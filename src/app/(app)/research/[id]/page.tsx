import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarClock,
  CalendarPlus,
  CheckCircle2,
  Circle,
  Clock3,
  ExternalLink,
  FileText,
  History,
  Link2,
  Pencil,
  Target,
  Trash2,
  TriangleAlert,
  Users,
} from "lucide-react";

import { Avatar } from "@/components/research/avatar";
import { CategoryChip } from "@/components/research/category-chip";
import { DeadlineBadge } from "@/components/research/deadline-badge";
import { PriorityBadge } from "@/components/research/priority-badge";
import { ProgressBar } from "@/components/research/progress-bar";
import { StatusBadge } from "@/components/research/status-badge";
import { ConfirmButton } from "@/components/shared/confirm-button";
import { EmptyState } from "@/components/shared/empty-state";
import { FlashMessage } from "@/components/shared/flash-message";
import { buttonClasses } from "@/components/ui/button";
import {
  AVAILABILITY_META,
  REFERENCE_SOURCE_LABELS,
  type AvailabilityValue,
  type ReferenceSourceValue,
} from "@/lib/constants";
import {
  formatDate,
  formatDateTime,
  getDeadlineInfo,
  getTimelineProgress,
} from "@/lib/dates";
import { cn } from "@/lib/utils";
import { requireUser } from "@/server/auth/session";
import { archiveResearchTopicAction } from "@/server/actions/research.actions";
import { getTopicById } from "@/server/services/research.service";

export const metadata: Metadata = {
  title: "Detail Riset",
};

export default async function ResearchDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const query = await searchParams;
  const topic = await getTopicById(id);

  if (!topic) {
    notFound();
  }

  const isManager = user.role === "MANAGER";
  const activeAssignments = topic.assignments.filter(
    (assignment) => assignment.isActive,
  );
  const primary = activeAssignments.find(
    (assignment) => assignment.role === "PRIMARY",
  );
  const backup = activeAssignments.find(
    (assignment) => assignment.role === "BACKUP",
  );
  const collaborators = activeAssignments.filter(
    (assignment) => assignment.role === "COLLABORATOR",
  );

  const deadlineInfo = getDeadlineInfo(topic.deadline, topic.status);
  const progress = getTimelineProgress(topic.startDate, topic.deadline);
  const dodItems = topic.dodChecklist?.items ?? [];
  const dodDone = dodItems.filter((item) => item.isChecked).length;

  const flash =
    query.created === "1"
      ? { tone: "success" as const, message: "Topik riset berhasil dibuat." }
      : query.updated === "1"
        ? { tone: "success" as const, message: "Perubahan topik riset berhasil disimpan." }
        : null;

  return (
    <div className="space-y-5">
      <Link
        href="/research"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-900"
      >
        <ArrowLeft className="size-4" />
        Kembali ke daftar riset
      </Link>

      {flash ? <FlashMessage tone={flash.tone} message={flash.message} /> : null}

      {topic.archivedAt ? (
        <FlashMessage
          tone="info"
          message={`Topik ini telah diarsipkan pada ${formatDateTime(topic.archivedAt)}.`}
        />
      ) : null}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={topic.status} />
              <PriorityBadge priority={topic.priority} />
              <DeadlineBadge deadline={topic.deadline} status={topic.status} />
              {topic.archivedAt ? (
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500 ring-1 ring-inset ring-slate-200">
                  Diarsipkan
                </span>
              ) : null}
            </div>
            <h1 className="mt-3 text-2xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-3xl">
              {topic.title}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              {topic.categories.map(({ category }) => (
                <CategoryChip
                  key={category.id}
                  name={category.name}
                  color={category.color}
                />
              ))}
            </div>
          </div>

          {isManager && !topic.archivedAt ? (
            <div className="flex shrink-0 items-center gap-2">
              <Link
                href={`/research/${topic.id}/edit`}
                className={buttonClasses({ variant: "secondary", size: "md" })}
              >
                <Pencil className="size-4" />
                Edit
              </Link>
              <form action={archiveResearchTopicAction.bind(null, topic.id)}>
                <ConfirmButton
                  type="submit"
                  message="Arsipkan topik riset ini? Topik tidak akan muncul di daftar aktif."
                  className={buttonClasses({ variant: "danger", size: "md" })}
                >
                  <Trash2 className="size-4" />
                  Arsipkan
                </ConfirmButton>
              </form>
            </div>
          ) : null}
        </div>

        <dl className="mt-6 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
              Mulai
            </dt>
            <dd className="mt-1 flex items-center gap-1.5 text-sm text-slate-700">
              <CalendarPlus className="size-4 text-slate-400" />
              {formatDate(topic.startDate)}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
              Deadline
            </dt>
            <dd className="mt-1 flex items-center gap-1.5 text-sm text-slate-700">
              <CalendarClock className="size-4 text-slate-400" />
              {formatDate(topic.deadline)}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
              Dibuat oleh
            </dt>
            <dd className="mt-1 text-sm text-slate-700">{topic.createdBy.name}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
              Terakhir diperbarui
            </dt>
            <dd className="mt-1 text-sm text-slate-700">
              {formatDateTime(topic.updatedAt)}
            </dd>
          </div>
        </dl>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-2">
              <FileText className="size-4 text-indigo-500" />
              <h2 className="text-sm font-semibold text-slate-900">
                Latar Belakang & Deskripsi
              </h2>
            </div>
            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">
              {topic.description}
            </p>

            {topic.objective ? (
              <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                <div className="flex items-center gap-2">
                  <Target className="size-4 text-emerald-500" />
                  <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Tujuan Riset
                  </h3>
                </div>
                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">
                  {topic.objective}
                </p>
              </div>
            ) : null}

            {topic.relevanceNote ? (
              <div className="mt-3 rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">
                <div className="flex items-center gap-2">
                  <TriangleAlert className="size-4 text-indigo-500" />
                  <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-indigo-700">
                    Relevansi Isu
                  </h3>
                </div>
                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">
                  {topic.relevanceNote}
                </p>
              </div>
            ) : null}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div className="flex items-center gap-2">
                <Link2 className="size-4 text-sky-500" />
                <h2 className="text-sm font-semibold text-slate-900">
                  Referensi Awal
                </h2>
              </div>
              <span className="text-xs text-slate-400">{topic.references.length} sumber</span>
            </div>
            {topic.references.length === 0 ? (
              <EmptyState
                icon={Link2}
                title="Belum ada referensi"
                description="Tambahkan referensi awal melalui form edit topik riset."
                className="border-0 bg-transparent py-10"
              />
            ) : (
              <ul className="divide-y divide-slate-100">
                {topic.references.map((reference) => (
                  <li key={reference.id} className="px-5 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <a
                          href={reference.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-900 hover:text-indigo-700"
                        >
                          <span className="truncate">{reference.title}</span>
                          <ExternalLink className="size-3.5 shrink-0 text-slate-400" />
                        </a>
                        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-600">
                            {REFERENCE_SOURCE_LABELS[
                              reference.sourceType as ReferenceSourceValue
                            ] ?? reference.sourceType}
                          </span>
                          {reference.publisher ? <span>{reference.publisher}</span> : null}
                          {reference.isPrimary ? (
                            <span className="font-medium text-indigo-600">Sumber utama</span>
                          ) : null}
                        </div>
                        {reference.relevanceNote ? (
                          <p className="mt-2 text-xs leading-5 text-slate-500">
                            {reference.relevanceNote}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
              <History className="size-4 text-slate-400" />
              <h2 className="text-sm font-semibold text-slate-900">
                Riwayat Status
              </h2>
            </div>
            {topic.statusHistory.length === 0 ? (
              <EmptyState
                icon={History}
                title="Belum ada riwayat"
                description="Riwayat perubahan status akan muncul di sini."
                className="border-0 bg-transparent py-10"
              />
            ) : (
              <ol className="space-y-0 px-5 py-4">
                {topic.statusHistory.map((entry, index) => (
                  <li key={entry.id} className="relative flex gap-3 pb-4 last:pb-0">
                    {index < topic.statusHistory.length - 1 ? (
                      <span className="absolute left-[7px] top-4 h-full w-px bg-slate-200" />
                    ) : null}
                    <span
                      className={cn(
                        "relative z-10 mt-1 size-3.5 shrink-0 rounded-full ring-4 ring-white",
                        entry.toStatus === "DONE"
                          ? "bg-emerald-500"
                          : entry.toStatus === "ARCHIVED"
                            ? "bg-slate-400"
                            : "bg-indigo-500",
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {entry.fromStatus ? (
                          <>
                            <StatusBadge status={entry.fromStatus} />
                            <span className="text-xs text-slate-400">→</span>
                          </>
                        ) : null}
                        <StatusBadge status={entry.toStatus} />
                      </div>
                      <p className="mt-1.5 text-xs leading-5 text-slate-600">
                        {entry.note ?? "Status diperbarui."}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-400">
                        {entry.changedBy.name} · {formatDateTime(entry.createdAt)}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>

        <div className="space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Clock3 className="size-4 text-indigo-500" />
              <h2 className="text-sm font-semibold text-slate-900">Timeline</h2>
            </div>

            <div
              className={cn(
                "mt-3 rounded-xl px-3 py-2.5 ring-1 ring-inset",
                deadlineInfo.tone === "rose"
                  ? "bg-rose-50 text-rose-700 ring-rose-200"
                  : deadlineInfo.tone === "amber"
                    ? "bg-amber-50 text-amber-700 ring-amber-200"
                    : deadlineInfo.tone === "emerald"
                      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                      : "bg-slate-50 text-slate-600 ring-slate-200",
              )}
            >
              <p className="text-sm font-semibold">{deadlineInfo.label}</p>
              <p className="text-[11px] opacity-80">{deadlineInfo.detail}</p>
            </div>

            <div className="mt-4">
              <div className="mb-1.5 flex items-center justify-between text-[11px] text-slate-500">
                <span>Progres waktu</span>
                <span className="font-medium text-slate-700">{progress.percent}%</span>
              </div>
              <ProgressBar
                value={progress.percent}
                barClassName={
                  deadlineInfo.tone === "rose"
                    ? "bg-rose-500"
                    : deadlineInfo.tone === "amber"
                      ? "bg-amber-500"
                      : "bg-indigo-500"
                }
              />
            </div>

            <dl className="mt-4 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">Tanggal mulai</dt>
                <dd className="font-medium text-slate-800">{formatDate(topic.startDate)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">Deadline</dt>
                <dd className="font-medium text-slate-800">{formatDate(topic.deadline)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">Durasi total</dt>
                <dd className="font-medium text-slate-800">{progress.totalDays} hari</dd>
              </div>
              {topic.completedAt ? (
                <div className="flex items-center justify-between">
                  <dt className="text-slate-500">Selesai pada</dt>
                  <dd className="font-medium text-emerald-700">
                    {formatDate(topic.completedAt)}
                  </dd>
                </div>
              ) : null}
            </dl>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Users className="size-4 text-indigo-500" />
              <h2 className="text-sm font-semibold text-slate-900">Tim Riset</h2>
            </div>

            <div className="mt-3 space-y-3">
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Analyst Utama
                </p>
                {primary ? (
                  <div className="mt-2 flex items-center gap-2.5">
                    <Avatar name={primary.user.name} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {primary.user.name}
                      </p>
                      <p className="flex items-center gap-1.5 text-[11px] text-slate-500">
                        <span
                          className={cn(
                            "size-1.5 rounded-full",
                            AVAILABILITY_META[
                              primary.user.availability as AvailabilityValue
                            ].dot,
                          )}
                        />
                        {
                          AVAILABILITY_META[
                            primary.user.availability as AvailabilityValue
                          ].label
                        }
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-amber-600">
                    <TriangleAlert className="size-3.5" />
                    Belum ada analyst utama
                  </p>
                )}
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Backup Analyst
                </p>
                {backup ? (
                  <div className="mt-2 flex items-center gap-2.5">
                    <Avatar name={backup.user.name} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {backup.user.name}
                      </p>
                      <p className="flex items-center gap-1.5 text-[11px] text-slate-500">
                        <span
                          className={cn(
                            "size-1.5 rounded-full",
                            AVAILABILITY_META[
                              backup.user.availability as AvailabilityValue
                            ].dot,
                          )}
                        />
                        {
                          AVAILABILITY_META[
                            backup.user.availability as AvailabilityValue
                          ].label
                        }
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-slate-500">Belum ditetapkan</p>
                )}
              </div>

              {collaborators.length > 0 ? (
                <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                    Kolaborator
                  </p>
                  <ul className="mt-2 space-y-2">
                    {collaborators.map((collaborator) => (
                      <li
                        key={collaborator.id}
                        className="flex items-center gap-2 text-sm text-slate-700"
                      >
                        <Avatar name={collaborator.user.name} size="sm" />
                        {collaborator.user.name}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-500" />
                <h2 className="text-sm font-semibold text-slate-900">Definition of Done</h2>
              </div>
              {dodItems.length > 0 ? (
                <span className="text-xs font-medium text-slate-500">
                  {dodDone}/{dodItems.length}
                </span>
              ) : null}
            </div>

            {dodItems.length === 0 ? (
              <p className="mt-3 text-xs leading-5 text-slate-500">
                Checklist DOD belum diterapkan pada topik ini. Template standar riset ESC
                dapat diterapkan pada sprint berikutnya.
              </p>
            ) : (
              <>
                <ProgressBar
                  value={Math.round((dodDone / dodItems.length) * 100)}
                  className="mt-3"
                  barClassName="bg-emerald-500"
                />
                <ul className="mt-3 space-y-2">
                  {dodItems.map((item) => (
                    <li key={item.id} className="flex items-start gap-2 text-xs">
                      {item.isChecked ? (
                        <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />
                      ) : (
                        <Circle className="mt-0.5 size-3.5 shrink-0 text-slate-300" />
                      )}
                      <span
                        className={cn(
                          "leading-5",
                          item.isChecked ? "text-slate-500 line-through" : "text-slate-700",
                        )}
                      >
                        {item.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
