import Link from "next/link";
import { FileQuestion } from "lucide-react";

import { buttonClasses } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 px-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <span className="mx-auto mb-4 inline-flex size-12 items-center justify-center rounded-xl bg-slate-50 text-slate-400 ring-1 ring-inset ring-slate-200">
          <FileQuestion className="size-6" />
        </span>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
          404
        </p>
        <h1 className="mt-1 text-lg font-semibold text-slate-900">
          Halaman tidak ditemukan
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Topik riset atau halaman yang Anda cari tidak tersedia.
        </p>
        <Link
          href="/dashboard"
          className={`${buttonClasses({ variant: "primary" })} mt-6`}
        >
          Kembali ke dashboard
        </Link>
      </div>
    </div>
  );
}
