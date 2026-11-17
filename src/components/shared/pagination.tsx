import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function buildHref(
  basePath: string,
  searchParams: Record<string, string | string[] | undefined>,
  page: number,
) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (key === "page" || value === undefined) continue;
    if (Array.isArray(value)) {
      for (const item of value) params.append(key, item);
    } else {
      params.set(key, value);
    }
  }

  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

function getPageWindow(page: number, totalPages: number): number[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
  return Array.from({ length: 5 }, (_, index) => start + index);
}

export function Pagination({
  page,
  totalPages,
  total,
  basePath,
  searchParams,
}: {
  page: number;
  totalPages: number;
  total: number;
  basePath: string;
  searchParams: Record<string, string | string[] | undefined>;
}) {
  if (totalPages <= 1) return null;

  const pages = getPageWindow(page, totalPages);

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-4 sm:flex-row">
      <p className="text-xs text-slate-500">
        Halaman <span className="font-medium text-slate-700">{page}</span> dari{" "}
        <span className="font-medium text-slate-700">{totalPages}</span> ·{" "}
        {total} riset
      </p>
      <div className="flex items-center gap-1">
        <Link
          href={buildHref(basePath, searchParams, Math.max(1, page - 1))}
          aria-disabled={page === 1}
          className={cn(
            buttonClasses({ variant: "secondary", size: "sm" }),
            page === 1 && "pointer-events-none opacity-50",
          )}
        >
          <ChevronLeft className="size-3.5" />
          Sebelumnya
        </Link>

        {pages.map((pageNumber) => (
          <Link
            key={pageNumber}
            href={buildHref(basePath, searchParams, pageNumber)}
            className={cn(
              "inline-flex size-8 items-center justify-center rounded-lg text-xs font-medium transition-colors",
              pageNumber === page
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100",
            )}
            aria-current={pageNumber === page ? "page" : undefined}
          >
            {pageNumber}
          </Link>
        ))}

        <Link
          href={buildHref(basePath, searchParams, Math.min(totalPages, page + 1))}
          aria-disabled={page === totalPages}
          className={cn(
            buttonClasses({ variant: "secondary", size: "sm" }),
            page === totalPages && "pointer-events-none opacity-50",
          )}
        >
          Berikutnya
          <ChevronRight className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}
