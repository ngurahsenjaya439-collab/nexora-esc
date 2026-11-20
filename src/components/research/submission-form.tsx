"use client";

import { useActionState, useState } from "react";
import {
  AlertCircle,
  ExternalLink,
  Loader2,
  Plus,
  Send,
  Trash2,
} from "lucide-react";

import { buttonClasses } from "@/components/ui/button";
import { initialActionState } from "@/lib/result";
import { cn } from "@/lib/utils";
import { submitResearchAction } from "@/server/actions/workflow.actions";

type AttachmentDraft = {
  key: string;
  label: string;
  url: string;
};

function makeKey(): string {
  return Math.random().toString(36).slice(2, 10);
}

const inputClasses =
  "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";
const textareaClasses =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm leading-6 text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return (
    <p className="mt-1.5 flex items-start gap-1.5 text-xs text-rose-600">
      <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
      {messages[0]}
    </p>
  );
}

export function SubmissionForm({
  topicId,
  blockedByDod,
  missingRequired,
  nextVersion,
}: {
  topicId: string;
  blockedByDod: boolean;
  missingRequired: number;
  nextVersion: number;
}) {
  const [state, formAction, pending] = useActionState(
    submitResearchAction.bind(null, topicId),
    initialActionState,
  );
  const [attachments, setAttachments] = useState<AttachmentDraft[]>([]);
  const errors = state.fieldErrors ?? {};

  const validAttachments = attachments
    .filter(
      (attachment) =>
        attachment.label.trim().length > 0 || attachment.url.trim().length > 0,
    )
    .map((attachment) => ({
      label: attachment.label.trim(),
      url: attachment.url.trim(),
    }));

  const updateAttachment = (
    key: string,
    patch: Partial<Omit<AttachmentDraft, "key">>,
  ) => {
    setAttachments((current) =>
      current.map((attachment) =>
        attachment.key === key ? { ...attachment, ...patch } : attachment,
      ),
    );
  };

  return (
    <form action={formAction} className="space-y-4">
      <input
        type="hidden"
        name="attachmentsJson"
        value={JSON.stringify(validAttachments)}
      />

      {state.message && !state.ok ? (
        <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs text-rose-700">
          <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
          <p>{state.message}</p>
        </div>
      ) : null}

      {blockedByDod ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs leading-5 text-amber-800">
          <p className="font-medium">
            Submission dikunci: {missingRequired} item DOD wajib belum dicentang.
          </p>
          <p className="mt-0.5">
            Selesaikan checklist Definition of Done di panel kanan sebelum
            mengirim hasil riset.
          </p>
        </div>
      ) : null}

      <div className="flex items-center justify-between">
        <label
          htmlFor="summary"
          className="block text-xs font-semibold text-slate-700"
        >
          Ringkasan Eksekutif <span className="text-rose-500">*</span>
        </label>
        <span className="text-[10px] text-slate-400">
          Submission v{nextVersion}
        </span>
      </div>
      <textarea
        id="summary"
        name="summary"
        required
        minLength={50}
        maxLength={10000}
        rows={5}
        placeholder="Tuliskan temuan utama, metodologi singkat, dan rekomendasi kebijakan/bisnis..."
        className={textareaClasses}
      />
      <FieldError messages={errors.summary} />

      <div>
        <label
          htmlFor="documentUrl"
          className="block text-xs font-semibold text-slate-700"
        >
          Tautan Dokumen Utama <span className="text-rose-500">*</span>
        </label>
        <input
          id="documentUrl"
          name="documentUrl"
          type="url"
          required
          placeholder="https://docs.google.com/document/d/..."
          className={cn(inputClasses, "mt-1.5")}
        />
        <p className="mt-1 text-[10px] text-slate-400">
          Google Docs, Drive, Notion, atau tautan dokumen lain yang dapat diakses
          tim.
        </p>
        <FieldError messages={errors.documentUrl} />
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-xs font-semibold text-slate-700">
              Lampiran Tautan Pendukung
            </p>
            <p className="mt-0.5 text-[10px] text-slate-400">
              Opsional, maksimal 5 tautan. Upload file belum diaktifkan.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              setAttachments((current) =>
                current.length >= 5
                  ? current
                  : [...current, { key: makeKey(), label: "", url: "" }],
              )
            }
            disabled={attachments.length >= 5}
            className={buttonClasses({ variant: "secondary", size: "sm" })}
          >
            <Plus className="size-3.5" />
            Tambah
          </button>
        </div>

        {attachments.length === 0 ? (
          <p className="mt-3 text-[11px] text-slate-400">
            Belum ada lampiran tambahan.
          </p>
        ) : (
          <div className="mt-3 space-y-2">
            {attachments.map((attachment, index) => (
              <div
                key={attachment.key}
                className="grid gap-2 rounded-lg border border-slate-200 bg-white p-2 sm:grid-cols-[1fr_1.4fr_auto]"
              >
                <input
                  type="text"
                  value={attachment.label}
                  onChange={(event) =>
                    updateAttachment(attachment.key, {
                      label: event.target.value,
                    })
                  }
                  placeholder={`Label lampiran ${index + 1}`}
                  maxLength={160}
                  className={inputClasses}
                  aria-label={`Label lampiran ${index + 1}`}
                />
                <input
                  type="url"
                  value={attachment.url}
                  onChange={(event) =>
                    updateAttachment(attachment.key, { url: event.target.value })
                  }
                  placeholder="https://..."
                  className={inputClasses}
                  aria-label={`URL lampiran ${index + 1}`}
                />
                <button
                  type="button"
                  onClick={() =>
                    setAttachments((current) =>
                      current.filter((item) => item.key !== attachment.key),
                    )
                  }
                  className="inline-flex h-10 items-center justify-center rounded-lg px-2 text-rose-500 transition hover:bg-rose-50"
                  aria-label={`Hapus lampiran ${index + 1}`}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        <FieldError messages={errors.attachments} />
      </div>

      <div className="flex flex-col-reverse items-stretch gap-2 border-t border-slate-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
        <a
          href="https://docs.google.com"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-slate-600"
        >
          <ExternalLink className="size-3" />
          Buka Google Docs
        </a>
        <button
          type="submit"
          disabled={pending || blockedByDod}
          className={buttonClasses({ variant: "accent", size: "md" })}
        >
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Mengirim...
            </>
          ) : (
            <>
              <Send className="size-4" />
              Kirim Hasil Riset
            </>
          )}
        </button>
      </div>
    </form>
  );
}
