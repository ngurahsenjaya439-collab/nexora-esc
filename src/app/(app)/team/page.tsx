import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  CalendarClock,
  FileCheck2,
  RotateCcw,
  UserCog,
  Users,
} from "lucide-react";

import { AvailabilityForm } from "@/components/research/availability-form";
import { Avatar } from "@/components/research/avatar";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { buttonClasses } from "@/components/ui/button";
import {
  AVAILABILITY_META,
  type AvailabilityValue,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import { requireManagerPage } from "@/server/auth/session";
import { listTeamOverview } from "@/server/services/user.service";

export const metadata: Metadata = {
  title: "Tim & Ketersediaan",
};

export default async function TeamPage() {
  const user = await requireManagerPage();
  const analysts = await listTeamOverview();

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="PBI-11 · Ketersediaan anggota"
        title="Tim & Ketersediaan"
        description="Kelola status ketersediaan Analyst dan pantau beban kerja aktif sebelum menetapkan penugasan baru."
        actions={
          <Link
            href="/research"
            className={buttonClasses({ variant: "secondary", size: "md" })}
          >
            <Users className="size-4" />
            Portofolio Riset
          </Link>
        }
      />

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <UserCog className="size-4 text-emerald-600" />
          <h2 className="text-sm font-semibold text-slate-900">
            Ketersediaan Saya
          </h2>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Status ini tampil pada menu akun dan menjadi acuan saat menetapkan
          analyst.
        </p>
        <div className="mt-3 max-w-xl">
          <AvailabilityForm
            targetUserId={user.id}
            initialAvailability={user.availability as AvailabilityValue}
            initialNote={user.availabilityNote}
          />
        </div>
      </section>

      {analysts.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Belum ada Analyst aktif"
          description="Tambahkan atau aktifkan akun Analyst terlebih dahulu."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {analysts.map((analyst) => {
            const availability =
              AVAILABILITY_META[analyst.availability as AvailabilityValue] ??
              AVAILABILITY_META.AVAILABLE;

            return (
              <section
                key={analyst.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar name={analyst.name} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {analyst.name}
                      </p>
                      <p className="truncate text-[11px] text-slate-500">
                        {analyst.email}
                      </p>
                      <p className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500">
                        <span
                          className={cn("size-1.5 rounded-full", availability.dot)}
                        />
                        {availability.label}
                        {analyst.availabilityNote
                          ? ` · ${analyst.availabilityNote}`
                          : ""}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/research?analystId=${analyst.id}`}
                    className="inline-flex shrink-0 items-center gap-1 text-[11px] font-medium text-emerald-700 hover:text-emerald-600"
                  >
                    Lihat riset
                    <ArrowUpRight className="size-3" />
                  </Link>
                </div>

                <dl className="mt-4 grid grid-cols-4 gap-2 border-y border-slate-100 py-3">
                  <div>
                    <dt className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                      Aktif
                    </dt>
                    <dd className="mt-0.5 text-lg font-semibold text-slate-900">
                      {analyst.activeTaskCount}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                      Overdue
                    </dt>
                    <dd
                      className={cn(
                        "mt-0.5 text-lg font-semibold",
                        analyst.overdueTaskCount > 0
                          ? "text-rose-600"
                          : "text-slate-900",
                      )}
                    >
                      {analyst.overdueTaskCount}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                      Revisi
                    </dt>
                    <dd className="mt-0.5 text-lg font-semibold text-amber-600">
                      {analyst.revisionNeededCount}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                      Review
                    </dt>
                    <dd className="mt-0.5 text-lg font-semibold text-violet-600">
                      {analyst.pendingReviewCount}
                    </dd>
                  </div>
                </dl>

                <div className="mt-3">
                  <AvailabilityForm
                    targetUserId={analyst.id}
                    initialAvailability={
                      analyst.availability as AvailabilityValue
                    }
                    initialNote={analyst.availabilityNote}
                  />
                </div>

                {analyst.overdueTaskCount > 0 ? (
                  <p className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-rose-600">
                    <CalendarClock className="size-3.5" />
                    {analyst.overdueTaskCount} tugas melewati deadline
                  </p>
                ) : analyst.revisionNeededCount > 0 ? (
                  <p className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-amber-600">
                    <RotateCcw className="size-3.5" />
                    {analyst.revisionNeededCount} tugas perlu revisi
                  </p>
                ) : analyst.pendingReviewCount > 0 ? (
                  <p className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-violet-600">
                    <FileCheck2 className="size-3.5" />
                    {analyst.pendingReviewCount} submission menunggu review
                  </p>
                ) : (
                  <p className="mt-3 text-[11px] text-slate-400">
                    Tidak ada pekerjaan yang menunggu tindakan.
                  </p>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
