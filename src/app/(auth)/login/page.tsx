import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ArrowRight, FlaskConical, ShieldCheck, Sparkles } from "lucide-react";

import { Avatar } from "@/components/research/avatar";
import { APP_NAME, AVAILABILITY_META } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { getCurrentUser } from "@/server/auth/session";
import { quickLogin } from "@/server/actions/auth.actions";
import { listDemoUsers } from "@/server/services/user.service";

export const metadata: Metadata = {
  title: "Masuk",
};

function safeRedirect(value: string | string[] | undefined): string {
  const path = typeof value === "string" ? value : "/dashboard";
  if (!path.startsWith("/") || path.startsWith("//")) return "/dashboard";
  if (path.startsWith("/login")) return "/dashboard";
  return path;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const currentUser = await getCurrentUser();
  const params = await searchParams;
  const redirectTo = safeRedirect(params.from);

  if (currentUser) {
    redirect(redirectTo);
  }

  const users = await listDemoUsers();
  const manager = users.find((user) => user.role === "MANAGER");
  const analysts = users.filter((user) => user.role === "ANALYST");
  const hasError = params.error === "user-not-found";

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <section className="relative hidden flex-col justify-between overflow-hidden bg-[#0b1220] p-12 text-white lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(60rem 40rem at 10% -10%, rgba(99,102,241,0.35), transparent 60%), radial-gradient(45rem 30rem at 90% 110%, rgba(14,165,233,0.28), transparent 60%)",
          }}
        />
        <div className="relative">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-emerald-600 text-base font-bold shadow-lg shadow-emerald-600/30">
              N
            </span>
            <div>
              <p className="text-sm font-semibold tracking-[0.22em]">{APP_NAME}</p>
              <p className="text-[11px] text-slate-400">ESC Research CMS</p>
            </div>
          </div>
        </div>

        <div className="relative max-w-md">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-medium text-emerald-200 ring-1 ring-inset ring-white/15">
            <Sparkles className="size-3" />
            Sprint 1 · MVP
          </p>
          <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tight">
            Satu workspace untuk seluruh siklus riset ESC.
          </h1>
          <p className="mt-4 text-sm leading-7 text-slate-400">
            Kelola topik riset, penugasan analyst dan backup, serta pantau
            deadline tim dalam satu dashboard yang rapi.
          </p>

          <ul className="mt-8 space-y-3 text-sm text-slate-300">
            <li className="flex items-start gap-3">
              <FlaskConical className="mt-0.5 size-4 shrink-0 text-emerald-500" />
              Topik riset dengan relevansi isu dan referensi awal.
            </li>
            <li className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-400" />
              Penugasan analyst utama dan backup yang jelas.
            </li>
          </ul>
        </div>

        <p className="relative text-[11px] text-slate-500">
          East Side Central · Departemen Research
        </p>
      </section>

      <section className="flex items-center justify-center bg-slate-50 px-5 py-12 sm:px-10">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-emerald-600 text-base font-bold text-white">
                N
              </span>
              <div>
                <p className="text-sm font-semibold tracking-[0.2em] text-slate-900">
                  {APP_NAME}
                </p>
                <p className="text-[11px] text-slate-500">ESC Research CMS</p>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
            Pilih akun demo
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Sprint 1 menggunakan quick role switcher. Pilih akun untuk melihat
            tampilan sesuai hak aksesnya — tanpa password.
          </p>

          {hasError ? (
            <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              Akun tidak ditemukan atau sudah tidak aktif. Silakan pilih akun lain.
            </div>
          ) : null}

          {manager ? (
            <div className="mt-6">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Manager
              </p>
              <form action={quickLogin}>
                <input type="hidden" name="userId" value={manager.id} />
                <input type="hidden" name="redirectTo" value={redirectTo} />
                <button
                  type="submit"
                  className="group flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-emerald-300 hover:shadow-md"
                >
                  <Avatar name={manager.name} size="lg" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-slate-900">
                      {manager.name}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-slate-500">
                      Head of Research · {manager.email}
                    </span>
                  </span>
                  <ArrowRight className="size-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-emerald-600" />
                </button>
              </form>
            </div>
          ) : null}

          <div className="mt-6">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Analyst
            </p>
            <div className="space-y-2">
              {analysts.map((analyst) => {
                const availability = AVAILABILITY_META[analyst.availability];
                return (
                  <form key={analyst.id} action={quickLogin}>
                    <input type="hidden" name="userId" value={analyst.id} />
                    <input type="hidden" name="redirectTo" value={redirectTo} />
                    <button
                      type="submit"
                      className="group flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 text-left shadow-sm transition hover:border-emerald-300 hover:shadow-md"
                    >
                      <Avatar name={analyst.name} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-slate-900">
                          {analyst.name}
                        </span>
                        <span className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                          <span
                            className={cn("size-1.5 rounded-full", availability.dot)}
                          />
                          {availability.label}
                          {analyst.availabilityNote ? (
                            <span className="truncate text-slate-400">
                              · {analyst.availabilityNote}
                            </span>
                          ) : null}
                        </span>
                      </span>
                      <ArrowRight className="size-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-emerald-600" />
                    </button>
                  </form>
                );
              })}
            </div>
          </div>

          <p className="mt-8 text-center text-xs text-slate-400">
            Demo environment · data contoh East Side Central
          </p>
        </div>
      </section>
    </div>
  );
}
