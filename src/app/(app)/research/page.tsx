import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, CalendarClock, FlaskConical, Plus, SearchX } from "lucide-react";

import { Avatar } from "@/components/research/avatar";
import { CategoryChip } from "@/components/research/category-chip";
import { DeadlineBadge } from "@/components/research/deadline-badge";
import { PriorityBadge } from "@/components/research/priority-badge";
import { StatusBadge } from "@/components/research/status-badge";
import { TopicFilters } from "@/components/research/topic-filters";
import { EmptyState } from "@/components/shared/empty-state";
import { FlashMessage } from "@/components/shared/flash-message";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { buttonClasses } from "@/components/ui/button";
import { formatDate } from "@/lib/dates";
import { requireUser } from "@/server/auth/session";
import {
  listCategories,
  listTopics,
  type TopicListItem,
} from "@/server/services/research.service";
import { listAnalystOptions } from "@/server/services/user.service";

export const metadata: Metadata = {
  title: "Riset",
};

function asString(value: string | string[] | undefined): string {
  return typeof value === "string" ? value : "";
}

function primaryAnalyst(topic: TopicListItem) {
  return topic.assignments.find((assignment) => assignment.role === "PRIMARY")?.user;
}

function backupAnalyst(topic: TopicListItem) {
  return topic.assignments.find((assignment) => assignment.role === "BACKUP")?.user;
}

export default async function ResearchListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireUser();
  const params = await searchParams;

  const q = asString(params.q);
  const status = asString(params.status);
  const categoryId = asString(params.categoryId);
  const analystId = asString(params.analystId);
  const due = asString(params.due);
  const page = Math.max(1, Number(asString(params.page)) || 1);

  const [result, categories, analysts] = await Promise.all([
    listTopics({ q, status, categoryId, analystId, due, page, pageSize: 8 }),
    listCategories(),
    listAnalystOptions(),
  ]);

  const flash =
    params.archived === "1"
      ? { tone: "success" as const, message: "Topik riset berhasil diarsipkan." }
      : params.created === "1"
        ? { tone: "success" as const, message: "Topik riset berhasil dibuat." }
        : null;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Portofolio riset"
        title="Riset"
        description="Seluruh topik riset ESC beserta status, analyst utama, dan indikator sisa waktu."
        actions={
          user.role === "MANAGER" ? (
            <Link
              href="/research/new"
              className={buttonClasses({ variant: "accent", size: "md" })}
            >
              <Plus className="size-4" />
              Buat Riset
            </Link>
          ) : null
        }
      />

      {flash ? <FlashMessage tone={flash.tone} message={flash.message} /> : null}

      <TopicFilters
        categories={categories.map(({ id, name }) => ({ id, name }))}
        analysts={analysts.map(({ id, name }) => ({ id, name }))}
        defaults={{ q, status, categoryId, analystId, due }}
      />

      {result.topics.length === 0 ? (
        <EmptyState
          icon={q || status || categoryId || analystId || due ? SearchX : FlaskConical}
          title={
            q || status || categoryId || analystId || due
              ? "Tidak ada riset yang cocok"
              : "Belum ada topik riset"
          }
          description={
            q || status || categoryId || analystId || due
              ? "Coba ubah kata kunci atau reset filter untuk melihat seluruh riset."
              : "Mulai dengan membuat topik riset pertama untuk tim ESC."
          }
          action={
            q || status || categoryId || analystId || due ? (
              <Link href="/research" className={buttonClasses({ variant: "secondary" })}>
                Reset filter
              </Link>
            ) : user.role === "MANAGER" ? (
              <Link
                href="/research/new"
                className={buttonClasses({ variant: "accent" })}
              >
                <Plus className="size-4" />
                Buat Riset
              </Link>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                  <th className="px-5 py-3 font-semibold">Riset</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Prioritas</th>
                  <th className="px-4 py-3 font-semibold">Analyst</th>
                  <th className="px-4 py-3 font-semibold">Deadline</th>
                  <th className="px-4 py-3 font-semibold">Sisa Waktu</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {result.topics.map((topic) => {
                  const primary = primaryAnalyst(topic);
                  const backup = backupAnalyst(topic);
                  return (
                    <tr
                      key={topic.id}
                      className="group transition-colors hover:bg-slate-50/80"
                    >
                      <td className="max-w-md px-5 py-4 align-top">
                        <Link
                          href={`/research/${topic.id}`}
                          className="block truncate text-sm font-semibold text-slate-900 group-hover:text-indigo-700"
                        >
                          {topic.title}
                        </Link>
                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                          {topic.categories.slice(0, 2).map(({ category }) => (
                            <CategoryChip
                              key={category.id}
                              name={category.name}
                              color={category.color}
                            />
                          ))}
                          {topic.categories.length > 2 ? (
                            <span className="text-[11px] text-slate-400">
                              +{topic.categories.length - 2}
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <StatusBadge status={topic.status} />
                      </td>
                      <td className="px-4 py-4 align-top">
                        <PriorityBadge priority={topic.priority} />
                      </td>
                      <td className="px-4 py-4 align-top">
                        {primary ? (
                          <div className="flex items-center gap-2">
                            <Avatar name={primary.name} size="sm" />
                            <div className="min-w-0">
                              <p className="max-w-32 truncate text-xs font-medium text-slate-800">
                                {primary.name}
                              </p>
                              {backup ? (
                                <p className="max-w-32 truncate text-[11px] text-slate-400">
                                  Backup: {backup.name}
                                </p>
                              ) : null}
                            </div>
                          </div>
                        ) : (
                          <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-700 ring-1 ring-inset ring-amber-200">
                            Belum ditugaskan
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 align-top">
                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-600">
                          <CalendarClock className="size-3.5 text-slate-400" />
                          {formatDate(topic.deadline)}
                        </span>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <DeadlineBadge deadline={topic.deadline} status={topic.status} />
                      </td>
                      <td className="px-4 py-4 align-top">
                        <Link
                          href={`/research/${topic.id}`}
                          className="inline-flex size-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white hover:text-indigo-600 hover:shadow-sm"
                          aria-label={`Buka ${topic.title}`}
                        >
                          <ArrowUpRight className="size-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 lg:hidden">
            {result.topics.map((topic) => {
              const primary = primaryAnalyst(topic);
              return (
                <Link
                  key={topic.id}
                  href={`/research/${topic.id}`}
                  className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition active:bg-slate-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold leading-5 text-slate-900">
                      {topic.title}
                    </p>
                    <ArrowUpRight className="mt-0.5 size-4 shrink-0 text-slate-300" />
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <StatusBadge status={topic.status} />
                    <PriorityBadge priority={topic.priority} />
                    <DeadlineBadge deadline={topic.deadline} status={topic.status} />
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
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
                      <span className="font-medium text-amber-600">Belum ditugaskan</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>

          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            total={result.total}
            basePath="/research"
            searchParams={params}
          />
        </>
      )}
    </div>
  );
}
