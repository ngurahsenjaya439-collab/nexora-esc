import Link from "next/link";
import type { ReactNode } from "react";

import { SidebarNav } from "@/components/layout/sidebar-nav";
import { UserMenu } from "@/components/layout/user-menu";
import { APP_NAME } from "@/lib/constants";
import { requireUser } from "@/server/auth/session";
import { listSwitchUsers } from "@/server/services/user.service";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  const users = await listSwitchUsers();

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-[#0b1220] lg:flex">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 border-b border-white/5 px-5 py-5"
        >
          <span className="grid size-9 place-items-center rounded-xl bg-emerald-600 text-sm font-bold text-white shadow-lg shadow-emerald-600/25">
            N
          </span>
          <span>
            <span className="block text-sm font-semibold tracking-[0.18em] text-white">
              {APP_NAME}
            </span>
            <span className="block text-[11px] text-slate-400">
              ESC Research
            </span>
          </span>
        </Link>
        <div className="flex flex-1 flex-col overflow-y-auto py-5">
          <SidebarNav variant="dark" role={user.role} />
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 backdrop-blur">
          <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <Link href="/dashboard" className="flex items-center gap-2.5 lg:hidden">
              <span className="grid size-8 place-items-center rounded-lg bg-emerald-600 text-xs font-bold text-white">
                N
              </span>
              <span className="text-sm font-semibold tracking-[0.16em] text-slate-900">
                {APP_NAME}
              </span>
            </Link>

            <div className="hidden items-center gap-2 text-sm text-slate-500 lg:flex">
              <span>Workspace</span>
              <span className="text-slate-300">/</span>
              <span className="font-medium text-slate-900">Research</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700 ring-1 ring-inset ring-amber-200 sm:inline-flex">
                <span className="size-1.5 rounded-full bg-amber-500" />
                Demo mode
              </span>
              <UserMenu user={user} users={users} />
            </div>
          </div>

          <div className="border-t border-slate-100 lg:hidden">
            <SidebarNav variant="light" role={user.role} />
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
