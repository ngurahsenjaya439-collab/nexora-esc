"use client";

import { useActionState, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Plus,
  Send,
  ShieldCheck,
  Trash2,
} from "lucide-react";

import { buttonClasses } from "@/components/ui/button";
import {
  REVISION_SEVERITY_META,
  REVISION_SEVERITY_VALUES,
  type RevisionSeverityValue,
} from "@/lib/constants";
import { initialActionState } from "@/lib/result";
import {
  REVISION_SECTIONS,
  type RevisionSectionValue,
} from "@/lib/research-workflow";
import { cn } from "@/lib/utils";
import { submitReviewAction } from "@/server/actions/workflow.actions";

type NoteDraft = {
  key: string;
  section: RevisionSectionValue;
  severity: RevisionSeverityValue;
  note: string;
};

function makeKey(): string {
  return Math.random().toString(36).slice(2, 10);
}

const inputClasses =
  "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";
const textareaClasses =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm leading-6 text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return (
    <p className="mt-1.5 flex items-start gap-1.5 text-xs text-rose-600">
      <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
      {messages[0]}
    </p>
  );
}

export function ReviewPanel({
  topicId,
  submissionId,
  submissionVersion,
  dodMissing,
  openRevisionNotes,
}: {
  topicId: string;
  submissionId: string;
  submissionVersion: number;
  dodMissing: number;
  openRevisionNotes: number;
}) {
  const approveBound = submitReviewAction.bind(null, topicId, submissionId);
  const revisionBound = submitReviewAction.bind(null, topicId, submissionId);
  const [approveState, approveAction, approvePending] = useActionState(
    approveBound,
    initialActionState,
  );
  const [revisionState, revisionAction, revisionPending] = useActionState(
    revisionBound,
    initialActionState,
  );
  const [notes, setNotes] = useState<NoteDraft[]>(() => [
    {
      key: makeKey(),
      section: "Analisis & Temuan",
      severity: "MEDIUM",
      note: "",
    },
  ]);

  const validNotes = notes
    .filter((note) => note.note.trim().length > 0)
    .map((note) => ({
      section: note.section,
      severity: note.severity,
      note: note.note.trim(),
    }));

  const updateNote = (key: string, patch: Partial<Omit<NoteDraft, "key">>) => {
    setNotes((current) =>
      current.map((note) => (note.key === key ? { ...note, ...patch } : note)),
    );
  };

  const approveErrors = approveState.fieldErrors ?? {};
  const revisionErrors = revisionState.fieldErrors ?? {};

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
        <div className="flex items-start gap-2.5">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-600" />
          <div>
            <p className="text-xs font-semibold text-emerald-900">
              Setujui Submission v{submissionVersion}
            </p>
            <p className="mt-1 text-[11px] leading-5 text-emerald-800">
              Approval akan menandai topik sebagai <strong>Done</strong> dan
              menyimpan keputusan review.
            </p>
          </div>
        </div>

        {dodMissing > 0 ? (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-white px-3 py-2 text-[11px] leading-5 text-amber-800">
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
            Masih ada {dodMissing} item DOD wajib yang belum dicentang. Verifikasi
            checklist terlebih dahulu sebelum menyetujui.
          </div>
        ) : null}

        {openRevisionNotes > 0 ? (
          <p className="mt-2 text-[11px] leading-5 text-amber-700">
            Catatan: masih ada {openRevisionNotes} catatan revisi berstatus open
            dari review sebelumnya.
          </p>
        ) : null}

        <form action={approveAction} className="mt-3 space-y-2.5">
          <input type="hidden" name="decision" value="APPROVED" />
          <textarea
            name="summary"
            rows={2}
            maxLength={3000}
            placeholder="Catatan approval (opsional)..."
            className={textareaClasses}
            aria-label="Catatan approval"
          />
          <FieldError messages={approveErrors.summary} />

          {approveState.message && !approveState.ok ? (
            <p className="flex items-start gap-1.5 text-xs text-rose-600">
              <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
              {approveState.message}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={approvePending || dodMissing > 0}
            className={buttonClasses({ variant: "primary", size: "md" })}
          >
            {approvePending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <CheckCircle2 className="size-4" />
            )}
            Setujui &amp; Selesaikan
          </button>
        </form>
      </div>

      <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-4">
        <div className="flex items-start gap-2.5">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" />
          <div>
            <p className="text-xs font-semibold text-amber-900">
              Minta Revisi Terstruktur
            </p>
            <p className="mt-1 text-[11px] leading-5 text-amber-800">
              Wajib minimal satu catatan per bagian. Status topik akan berubah
              menjadi <strong>Revision Needed</strong>.
            </p>
          </div>
        </div>

        <form action={revisionAction} className="mt-3 space-y-3">
          <input type="hidden" name="decision" value="REVISION_REQUESTED" />
          <input
            type="hidden"
            name="revisionNotesJson"
            value={JSON.stringify(validNotes)}
          />

          <textarea
            name="summary"
            rows={2}
            maxLength={3000}
            placeholder="Ringkasan review / arahan utama untuk analyst (opsional)..."
            className={textareaClasses}
            aria-label="Ringkasan review"
          />

          <div className="space-y-2">
            {notes.map((note, index) => (
              <div
                key={note.key}
                className="rounded-lg border border-amber-200/70 bg-white p-3"
              >
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Catatan {index + 1}
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      setNotes((current) =>
                        current.filter((item) => item.key !== note.key),
                      )
                    }
                    disabled={notes.length <= 1}
                    className="inline-flex items-center gap-1 text-[10px] font-medium text-rose-600 hover:text-rose-500 disabled:opacity-40"
                  >
                    <Trash2 className="size-3" />
                    Hapus
                  </button>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <select
                    value={note.section}
                    onChange={(event) =>
                      updateNote(note.key, {
                        section: event.target.value as RevisionSectionValue,
                      })
                    }
                    className={inputClasses}
                    aria-label={`Bagian catatan ${index + 1}`}
                  >
                    {REVISION_SECTIONS.map((section) => (
                      <option key={section.value} value={section.value}>
                        {section.label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={note.severity}
                    onChange={(event) =>
                      updateNote(note.key, {
                        severity: event.target.value as RevisionSeverityValue,
                      })
                    }
                    className={inputClasses}
                    aria-label={`Severity catatan ${index + 1}`}
                  >
                    {REVISION_SEVERITY_VALUES.map((severity) => (
                      <option key={severity} value={severity}>
                        {REVISION_SEVERITY_META[severity].label}
                      </option>
                    ))}
                  </select>
                </div>

                <textarea
                  value={note.note}
                  onChange={(event) =>
                    updateNote(note.key, { note: event.target.value })
                  }
                  rows={3}
                  minLength={10}
                  maxLength={1500}
                  placeholder="Jelaskan bagian yang perlu diperbaiki dan arah perbaikannya..."
                  className={cn(textareaClasses, "mt-2")}
                  aria-label={`Isi catatan ${index + 1}`}
                />
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() =>
              setNotes((current) =>
                current.length >= 10
                  ? current
                  : [
                      ...current,
                      {
                        key: makeKey(),
                        section: "Lainnya",
                        severity: "MEDIUM",
                        note: "",
                      },
                    ],
              )
            }
            disabled={notes.length >= 10}
            className={buttonClasses({ variant: "secondary", size: "sm" })}
          >
            <Plus className="size-3.5" />
            Tambah Catatan
          </button>

          <FieldError
            messages={
              revisionErrors.revisionNotes ??
              revisionErrors.note ??
              revisionErrors["revisionNotes"] ??
              revisionErrors.form
            }
          />

          {revisionState.message && !revisionState.ok ? (
            <p className="flex items-start gap-1.5 text-xs text-rose-600">
              <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
              {revisionState.message}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={revisionPending}
            className={buttonClasses({ variant: "danger", size: "md" })}
          >
            {revisionPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
            Kirim Permintaan Revisi
          </button>
        </form>
      </div>
    </div>
  );
}
