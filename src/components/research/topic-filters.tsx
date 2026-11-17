"use client";

import { useRef } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, X } from "lucide-react";

import { buttonClasses } from "@/components/ui/button";
import { STATUS_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";

type Option = { id: string; name: string };

export function TopicFilters({
  categories,
  analysts,
  defaults,
}: {
  categories: Option[];
  analysts: Option[];
  defaults: {
    q: string;
    status: string;
    categoryId: string;
    analystId: string;
    due: string;
  };
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const hasFilters = Boolean(
    defaults.q ||
      defaults.status ||
      defaults.categoryId ||
      defaults.analystId ||
      defaults.due,
  );

  const submit = () => formRef.current?.requestSubmit();

  const selectClasses =
    "h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";

  return (
    <form
      ref={formRef}
      method="get"
      action="/research"
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            name="q"
            defaultValue={defaults.q}
            placeholder="Cari judul, deskripsi, atau relevansi isu..."
            className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:w-auto">
          <select
            name="status"
            defaultValue={defaults.status}
            onChange={submit}
            className={selectClasses}
            aria-label="Filter status"
          >
            <option value="">Semua status</option>
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            name="categoryId"
            defaultValue={defaults.categoryId}
            onChange={submit}
            className={selectClasses}
            aria-label="Filter kategori"
          >
            <option value="">Semua kategori</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <select
            name="analystId"
            defaultValue={defaults.analystId}
            onChange={submit}
            className={selectClasses}
            aria-label="Filter analyst"
          >
            <option value="">Semua analyst</option>
            {analysts.map((analyst) => (
              <option key={analyst.id} value={analyst.id}>
                {analyst.name}
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
            <option value="approaching">Mendekati deadline</option>
            <option value="overdue">Overdue</option>
            <option value="attention">Perlu perhatian</option>
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
              href="/research"
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
