import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

const tones = {
  indigo: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  blue: "bg-emerald-50 text-blue-600 ring-blue-100",
  amber: "bg-amber-50 text-amber-600 ring-amber-100",
  emerald: "bg-emerald-50 text-emerald-600 ring-emerald-100",
  rose: "bg-rose-50 text-rose-600 ring-rose-100",
} as const;

export function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "indigo",
  href,
}: {
  label: string;
  value: number | string;
  hint?: string;
  icon: LucideIcon;
  tone?: keyof typeof tones;
  href?: string;
}) {
  const content = (
    <div className="group flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span
          className={cn(
            "inline-flex size-9 items-center justify-center rounded-xl ring-1 ring-inset",
            tones[tone],
          )}
        >
          <Icon className="size-4" />
        </span>
      </div>
      <div className="mt-4">
        <p className="text-3xl font-semibold tracking-tight text-slate-950">
          {value}
        </p>
        {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full">
        {content}
      </Link>
    );
  }

  return content;
}
