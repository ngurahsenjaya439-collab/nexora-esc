import Link from "next/link";
import { ArrowUpRight, CalendarClock, UserRound } from "lucide-react";

import { Avatar } from "@/components/research/avatar";
import { CategoryChip } from "@/components/research/category-chip";
import { DeadlineBadge } from "@/components/research/deadline-badge";
import { PriorityBadge } from "@/components/research/priority-badge";
import { StatusBadge } from "@/components/research/status-badge";
import { Badge } from "@/components/ui/badge";
import {
  SUBMISSION_STATUS_META,
  type SubmissionStatusValue,
} from "@/lib/constants";
import { formatDate } from "@/lib/dates";
import { cn } from "@/lib/utils";
import type { MyTaskItem } from "@/server/services/research.service";

function myRole(topic: MyTaskItem, userId: string) {
  return topic.assignments.find(
    (assignment) => assignment.userId === userId && assignment.isActive,
  )?.role;
}

function RoleBadge({ role }: { role?: string }) {
  if (!role) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-medium ring-1 ring-inset",
        role === "PRIMARY"
          ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
          : "bg-slate-50 text-slate-600 ring-slate-200",
      )}
    >
      <UserRound className="size-3" />
      {role === "PRIMARY" ? "Primary" : "Backup"}
    </span>
  );
}

function LatestSubmission({ topic }: { topic: MyTaskItem }) {
  const latest = topic.submissions[0];
  if (!latest) {
    return <span className="text-[11px] text-slate-400">Belum ada</span>;
  }
  const meta =
    SUBMISSION_STATUS_META[latest.status as SubmissionStatusValue] ??
    SUBMISSION_STATUS_META.PENDING_REVIEW;

  return (
    <Badge className={meta.badge}>
      <span className={cn("size-1.5 rounded-full", meta.dot)} />
      v{latest.version} · {meta.label}
    </Badge>
  );
}

export function MyTaskList({
  tasks,
  userId,
}: {
  tasks: MyTaskItem[];
  userId: string;
}) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
              <th className="px-5 py-3 font-semibold">Tugas</th>
              <th className="px-4 py-3 font-semibold">Peran</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Submission</th>
              <th className="px-4 py-3 font-semibold">Deadline</th>
              <th className="px-4 py-3 font-semibold">Sisa Waktu</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tasks.map((topic) => {
              const role = myRole(topic, userId);
              const primary = topic.assignments.find(
                (assignment) => assignment.role === "PRIMARY",
              )?.user;

              return (
                <tr
                  key={topic.id}
                  className="group transition-colors hover:bg-slate-50/80"
                >
                  <td className="max-w-md px-5 py-4 align-top">
                    <Link
                      href={`/research/${topic.id}`}
                      className="block truncate text-sm font-semibold text-slate-900 group-hover:text-emerald-700"
                    >
                      {topic.title}
                    </Link>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <PriorityBadge priority={topic.priority} />
                      {topic.categories.slice(0, 2).map(({ category }) => (
                        <CategoryChip
                          key={category.id}
                          name={category.name}
                          color={category.color}
                        />
                      ))}
                    </div>
                    <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-slate-400">
                      <Avatar
                        name={primary?.name ?? "?"}
                        size="sm"
                        className="size-4 text-[8px]"
                      />
                      {primary ? `Primary: ${primary.name}` : "Belum ada primary"}
                    </p>
                  </td>
                  <td className="px-4 py-4 align-top">
                    <RoleBadge role={role} />
                  </td>
                  <td className="px-4 py-4 align-top">
                    <StatusBadge status={topic.status} />
                  </td>
                  <td className="px-4 py-4 align-top">
                    <LatestSubmission topic={topic} />
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
                      className="inline-flex size-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white hover:text-emerald-700 hover:shadow-sm"
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
        {tasks.map((topic) => {
          const role = myRole(topic, userId);
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
                <RoleBadge role={role} />
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                  <CalendarClock className="size-3.5 text-slate-400" />
                  {formatDate(topic.deadline)}
                </span>
                <DeadlineBadge deadline={topic.deadline} status={topic.status} />
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
