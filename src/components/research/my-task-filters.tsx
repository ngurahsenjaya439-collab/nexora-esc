"use client";

import { useRef } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, X } from "lucide-react";

import { buttonClasses } from "@/components/ui/button";
import { TASK_STATUS_OPTIONS } from "@/lib/constants";
import {
  TASK_DUE_OPTIONS,
  TASK_ROLE_OPTIONS,
} from "@/lib/research-workflow";
import { cn } from "@/lib/utils";

const selectClasses =
  "h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";

export function MyTaskFilters({
  defaults,
}: {
  defaults: { q: string; status: string; due: string; role: string };
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const hasFilters = Boolean(
    defaults.q || defaults.status || defaults.due || defaults.role,
  );

  const submit = () => formRef.current?.requestSubmit();

  return (
    <form
      ref={formRef}
      method="get"
      action="/my-tasks"
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            name="q"
            defaultValue={defaults.q}
            placeholder="Cari judul atau deskripsi tugas..."
            className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:w-auto">
          <select
            name="status"
            defaultValue={defaults.status}
            onChange={submit}
            className={selectClasses}
            aria-label="Filter status"
          >
            <option value="">Semua status</option>
            {TASK_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            name="due"
            defaultValue={defaults.due}
            onChange={submit}
            className={selectClasses}
            aria-label="Filter deadline"
          >
            <option value="">Semua deadline</option>
            {TASK_DUE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            name="role"
            defaultValue={defaults.role}
            onChange={submit}
            className={selectClasses}
            aria-label="Filter peran"
          >
            <option value="">Semua peran</option>
            {TASK_ROLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 lg:ml-1">
          <button
            type="submit"
            className={cn(
              buttonClasses({ variant: "secondary", size: "md" }),
              "lg:hidden",
            )}
          >
            <SlidersHorizontal className="size-4" />
            Terapkan
          </button>
          {hasFilters ? (
            <Link
              href="/my-tasks"
              className={buttonClasses({ variant: "ghost", size: "md" })}
            >
              <X className="size-4" />
              Reset
            </Link>
          ) : null}
        </div>
      </div>
    </form>
  );
}
