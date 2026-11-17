"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FlaskConical, LayoutDashboard, Plus } from "lucide-react";

import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/research", label: "Riset", icon: FlaskConical },
];

export function SidebarNav({
  variant,
  role,
}: {
  variant: "dark" | "light";
  role: "MANAGER" | "ANALYST";
}) {
  const pathname = usePathname();
  const isDark = variant === "dark";

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  if (!isDark) {
    return (
      <nav className="flex items-center gap-1 overflow-x-auto px-4 py-2">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100",
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
        {role === "MANAGER" ? (
          <Link
            href="/research/new"
            className="inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50"
          >
            <Plus className="size-4" />
            Buat Riset
          </Link>
        ) : null}
      </nav>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 px-3">
      <nav className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-slate-400 hover:bg-white/5 hover:text-white",
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {role === "MANAGER" ? (
        <Link
          href="/research/new"
          className={cn(
            buttonClasses({ variant: "accent", size: "md" }),
            "w-full shadow-indigo-950/30",
          )}
        >
          <Plus className="size-4" />
          Buat Riset Baru
        </Link>
      ) : null}

      <div className="mt-auto rounded-xl border border-white/10 bg-white/5 p-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          Sprint 1 · MVP
        </p>
        <p className="mt-1 text-xs leading-5 text-slate-400">
          Topik, penugasan, dan timeline riset dalam satu workspace.
        </p>
      </div>
    </div>
  );
}
