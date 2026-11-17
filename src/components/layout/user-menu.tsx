"use client";

import { usePathname } from "next/navigation";
import { ChevronDown, LogOut } from "lucide-react";

import { Avatar } from "@/components/research/avatar";
import { AVAILABILITY_META, type AvailabilityValue } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { logout, switchUser } from "@/server/actions/auth.actions";

type MenuUser = {
  id: string;
  name: string;
  email: string;
  role: "MANAGER" | "ANALYST";
  availability: AvailabilityValue;
};

export function UserMenu({
  user,
  users,
}: {
  user: MenuUser;
  users: MenuUser[];
}) {
  const pathname = usePathname();
  const otherUsers = users.filter((candidate) => candidate.id !== user.id);

  return (
    <details className="group relative">
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-xl border border-transparent p-1.5 transition hover:bg-slate-50 [&::-webkit-details-marker]:hidden">
        <Avatar name={user.name} size="sm" />
        <span className="hidden min-w-0 text-left sm:block">
          <span className="block max-w-36 truncate text-sm font-medium text-slate-900">
            {user.name}
          </span>
          <span className="block text-[11px] text-slate-500">
            {user.role === "MANAGER" ? "Manager" : "Analyst"}
          </span>
        </span>
        <ChevronDown className="size-4 text-slate-400 transition group-open:rotate-180" />
      </summary>

      <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10">
        <div className="border-b border-slate-100 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
            Akun aktif
          </p>
          <div className="mt-2 flex items-center gap-3">
            <Avatar name={user.name} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">
                {user.name}
              </p>
              <p className="truncate text-xs text-slate-500">{user.email}</p>
            </div>
          </div>
        </div>

        {otherUsers.length > 0 ? (
          <div className="p-2">
            <p className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              Ganti akun · demo
            </p>
            {otherUsers.map((candidate) => {
              const availability = AVAILABILITY_META[candidate.availability];
              return (
                <form key={candidate.id} action={switchUser}>
                  <input type="hidden" name="userId" value={candidate.id} />
                  <input type="hidden" name="redirectTo" value={pathname} />
                  <button
                    type="submit"
                    className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-slate-50"
                  >
                    <Avatar name={candidate.name} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-slate-800">
                        {candidate.name}
                      </span>
                      <span className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-500">
                        <span
                          className={cn("size-1.5 rounded-full", availability.dot)}
                        />
                        {candidate.role === "MANAGER" ? "Manager" : "Analyst"} ·{" "}
                        {availability.label}
                      </span>
                    </span>
                  </button>
                </form>
              );
            })}
          </div>
        ) : null}

        <div className="border-t border-slate-100 p-2">
          <form action={logout}>
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
            >
              <LogOut className="size-4" />
              Keluar
            </button>
          </form>
        </div>
      </div>
    </details>
  );
}
