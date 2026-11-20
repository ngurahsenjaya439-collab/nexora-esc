"use client";

import { useState, useTransition } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  RotateCcw,
  StickyNote,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  REVISION_SEVERITY_META,
  REVISION_STATUS_META,
  type RevisionSeverityValue,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import { resolveRevisionNoteAction } from "@/server/actions/workflow.actions";

export type RevisionNoteView = {
  id: string;
  section: string;
  note: string;
  severity: RevisionSeverityValue;
  status: "OPEN" | "RESOLVED";
  authorName: string;
  createdAtLabel: string;
  resolvedByName: string | null;
  submissionVersion: number | null;
};

export function RevisionNotes({
  notes,
  canResolve,
}: {
  notes: RevisionNoteView[];
  canResolve: boolean;
}) {
  const [statusMap, setStatusMap] = useState<Record<string, "OPEN" | "RESOLVED">>(
    () => Object.fromEntries(notes.map((note) => [note.id, note.status])),
  );
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  if (notes.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-6 text-center text-xs text-slate-500">
        Tidak ada catatan revisi. Manager belum meminta perbaikan pada riset ini.
      </p>
    );
  }

  const handleToggle = (note: RevisionNoteView) => {
    const next = statusMap[note.id] === "RESOLVED" ? "OPEN" : "RESOLVED";
    setError(null);
    setStatusMap((current) => ({ ...current, [note.id]: next }));
    setPendingId(note.id);

    startTransition(async () => {
      const result = await resolveRevisionNoteAction(note.id, next === "RESOLVED");
      setPendingId(null);
      if (!result.ok) {
        setStatusMap((current) => ({
          ...current,
          [note.id]: next === "RESOLVED" ? "OPEN" : "RESOLVED",
        }));
        setError(result.message ?? "Gagal memperbarui catatan revisi.");
      }
    });
  };

  const openCount = notes.filter((note) => statusMap[note.id] === "OPEN").length;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[11px] text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <StickyNote className="size-3.5 text-amber-500" />
          {notes.length} catatan revisi
        </span>
        <span
          className={cn(
            "font-medium",
            openCount > 0 ? "text-amber-600" : "text-emerald-600",
          )}
        >
          {openCount > 0 ? `${openCount} masih open` : "Semua selesai"}
        </span>
      </div>

      {notes.map((note) => {
        const severity =
          REVISION_SEVERITY_META[note.severity] ?? REVISION_SEVERITY_META.MEDIUM;
        const currentStatus = statusMap[note.id] ?? note.status;
        const statusMeta = REVISION_STATUS_META[currentStatus];
        const isPending = pendingId === note.id;

        return (
          <article
            key={note.id}
            className={cn(
              "rounded-xl border p-3 transition",
              currentStatus === "RESOLVED"
                ? "border-emerald-100 bg-emerald-50/40"
                : "border-amber-100 bg-amber-50/40",
            )}
          >
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge className={severity.badge}>
                <span className={cn("size-1.5 rounded-full", severity.dot)} />
                {severity.label}
              </Badge>
              <span className="rounded-md bg-white px-2 py-0.5 text-[10px] font-medium text-slate-600 ring-1 ring-inset ring-slate-200">
                {note.section}
              </span>
              <Badge className={statusMeta.badge}>{statusMeta.label}</Badge>
              {note.submissionVersion ? (
                <span className="text-[10px] text-slate-400">
                  v{note.submissionVersion}
                </span>
              ) : null}
            </div>

            <p className="mt-2 whitespace-pre-line text-xs leading-5 text-slate-700">
              {note.note}
            </p>

            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              <p className="text-[10px] text-slate-400">
                {note.authorName} · {note.createdAtLabel}
                {note.resolvedByName
                  ? ` · diselesaikan ${note.resolvedByName}`
                  : ""}
              </p>

              {canResolve ? (
                <button
                  type="button"
                  onClick={() => handleToggle(note)}
                  disabled={isPending}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium ring-1 ring-inset transition",
                    currentStatus === "RESOLVED"
                      ? "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50"
                      : "bg-white text-emerald-700 ring-emerald-200 hover:bg-emerald-50",
                  )}
                >
                  {isPending ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : currentStatus === "RESOLVED" ? (
                    <RotateCcw className="size-3" />
                  ) : (
                    <CheckCircle2 className="size-3" />
                  )}
                  {currentStatus === "RESOLVED"
                    ? "Buka kembali"
                    : "Tandai selesai"}
                </button>
              ) : null}
            </div>
          </article>
        );
      })}

      {error ? (
        <p className="flex items-start gap-1.5 text-xs text-rose-600">
          <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
          {error}
        </p>
      ) : null}
    </div>
  );
}
