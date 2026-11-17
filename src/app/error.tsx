"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 px-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <span className="mx-auto mb-4 inline-flex size-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600 ring-1 ring-inset ring-rose-100">
          <AlertTriangle className="size-6" />
        </span>
        <h1 className="text-lg font-semibold text-slate-900">
          Terjadi kesalahan
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Halaman gagal dimuat. Coba muat ulang, atau kembali ke dashboard.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Button onClick={reset}>Coba lagi</Button>
          <a href="/dashboard" className="inline-flex">
            <Button variant="secondary">Ke dashboard</Button>
          </a>
        </div>
      </div>
    </div>
  );
}
