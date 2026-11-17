"use client";

import { useActionState, useState, type FormEvent } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import {
  AlertCircle,
  CalendarClock,
  Link2,
  Loader2,
  Plus,
  Save,
  Trash2,
  UserRound,
  Users,
} from "lucide-react";

import { buttonClasses } from "@/components/ui/button";
import {
  PRIORITY_OPTIONS,
  REFERENCE_SOURCE_LABELS,
  REFERENCE_SOURCE_VALUES,
  STATUS_OPTIONS,
  type ReferenceSourceValue,
} from "@/lib/constants";
import { initialActionState, type ActionState } from "@/lib/result";
import { cn } from "@/lib/utils";

type CategoryOption = {
  id: string;
  name: string;
  color: string;
};

type AnalystOption = {
  id: string;
  name: string;
  availability: string;
  availabilityNote: string | null;
  activeTaskCount: number;
};

export type ResearchFormValues = {
  title: string;
  description: string;
  objective: string;
  relevanceNote: string;
  status: string;
  priority: string;
  startDate: string;
  deadline: string;
  categoryIds: string[];
  primaryAnalystId: string;
  backupAnalystId: string;
  references: { title: string; url: string; sourceType: string }[];
};

type ReferenceDraft = {
  key: string;
  title: string;
  url: string;
  sourceType: ReferenceSourceValue;
};

function makeKey(): string {
  return Math.random().toString(36).slice(2, 10);
}

function toReferenceDrafts(
  references: ResearchFormValues["references"],
): ReferenceDraft[] {
  return references.map((reference) => ({
    key: makeKey(),
    title: reference.title,
    url: reference.url,
    sourceType: (reference.sourceType as ReferenceSourceValue) ?? "NEWS",
  }));
}

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return (
    <p className="mt-1.5 flex items-start gap-1.5 text-xs text-rose-600">
      <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
      {messages[0]}
    </p>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={buttonClasses({ variant: "accent", size: "lg" })}
    >
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          Menyimpan...
        </>
      ) : (
        <>
          <Save className="size-4" />
          {label}
        </>
      )}
    </button>
  );
}

const inputClasses =
  "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";
const textareaClasses =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm leading-6 text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";
const labelClasses = "block text-xs font-semibold text-slate-700";

export function ResearchForm({
  action,
  mode,
  categories,
  analysts,
  initial,
  cancelHref,
}: {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  mode: "create" | "edit";
  categories: CategoryOption[];
  analysts: AnalystOption[];
  initial: ResearchFormValues;
  cancelHref: string;
}) {
  const [state, formAction] = useActionState(action, initialActionState);
  const [clientError, setClientError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState(initial.startDate);
  const [deadline, setDeadline] = useState(initial.deadline);
  const [primaryAnalystId, setPrimaryAnalystId] = useState(
    initial.primaryAnalystId,
  );
  const [backupAnalystId, setBackupAnalystId] = useState(initial.backupAnalystId);
  const [references, setReferences] = useState<ReferenceDraft[]>(() =>
    toReferenceDrafts(initial.references),
  );

  const errors = state.fieldErrors ?? {};
  const submitLabel = mode === "create" ? "Simpan Topik Riset" : "Simpan Perubahan";

  const updateReference = (
    key: string,
    patch: Partial<Omit<ReferenceDraft, "key">>,
  ) => {
    setReferences((current) =>
      current.map((reference) =>
        reference.key === key ? { ...reference, ...patch } : reference,
      ),
    );
  };

  const validReferences = references
    .filter(
      (reference) => reference.title.trim().length > 0 || reference.url.trim().length > 0,
    )
    .map((reference) => ({
      title: reference.title.trim(),
      url: reference.url.trim(),
      sourceType: reference.sourceType,
    }));

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    setClientError(null);

    if (startDate && deadline && deadline < startDate) {
      event.preventDefault();
      setClientError("Deadline tidak boleh lebih awal dari tanggal mulai.");
      return;
    }

    if (primaryAnalystId && backupAnalystId && primaryAnalystId === backupAnalystId) {
      event.preventDefault();
      setClientError("Backup analyst harus berbeda dari analyst utama.");
    }
  };

  return (
    <form action={formAction} onSubmit={handleSubmit} className="space-y-5">
      {state.message && !state.ok ? (
        <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <p>{state.message}</p>
        </div>
      ) : null}

      {clientError ? (
        <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <p>{clientError}</p>
        </div>
      ) : null}

      {initial.references.length > 0 && mode === "edit" ? (
        <div className="rounded-xl border border-sky-100 bg-sky-50/70 px-4 py-3 text-xs leading-5 text-sky-800">
          Referensi yang tersimpan akan diganti dengan daftar di bawah saat Anda
          menyimpan perubahan.
        </div>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-sm font-semibold text-slate-900">Informasi Riset</h2>
        <p className="mt-1 text-xs text-slate-500">
          Judul, latar belakang, dan relevansi isu menjadi konteks utama tim.
        </p>

        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="title" className={labelClasses}>
              Judul Riset <span className="text-rose-500">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              minLength={5}
              maxLength={200}
              defaultValue={initial.title}
              placeholder="Contoh: Peta Daya Beli Gen Z di Kota Bandung"
              className={cn(inputClasses, "mt-1.5")}
            />
            <FieldError messages={errors.title} />
          </div>

          <div>
            <label htmlFor="description" className={labelClasses}>
              Deskripsi / Latar Belakang <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              required
              minLength={20}
              maxLength={5000}
              rows={5}
              defaultValue={initial.description}
              placeholder="Jelaskan konteks, permasalahan, dan cakupan riset..."
              className={cn(textareaClasses, "mt-1.5")}
            />
            <div className="mt-1 flex items-center justify-between">
              <FieldError messages={errors.description} />
              <span className="text-[11px] text-slate-400">Minimal 20 karakter</span>
            </div>
          </div>

          <div>
            <label htmlFor="objective" className={labelClasses}>
              Tujuan Riset
            </label>
            <textarea
              id="objective"
              name="objective"
              maxLength={3000}
              rows={3}
              defaultValue={initial.objective}
              placeholder="Output atau keputusan apa yang ingin dihasilkan dari riset ini?"
              className={cn(textareaClasses, "mt-1.5")}
            />
            <FieldError messages={errors.objective} />
          </div>

          <div>
            <label htmlFor="relevanceNote" className={labelClasses}>
              Relevansi Isu
            </label>
            <textarea
              id="relevanceNote"
              name="relevanceNote"
              maxLength={3000}
              rows={3}
              defaultValue={initial.relevanceNote}
              placeholder="Mengapa isu ini penting sekarang dan bagi ESC?"
              className={cn(textareaClasses, "mt-1.5")}
            />
            <FieldError messages={errors.relevanceNote} />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-2">
          <CalendarClock className="size-4 text-indigo-500" />
          <h2 className="text-sm font-semibold text-slate-900">Status & Timeline</h2>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label htmlFor="status" className={labelClasses}>
              Status <span className="text-rose-500">*</span>
            </label>
            <select
              id="status"
              name="status"
              defaultValue={initial.status}
              className={cn(inputClasses, "mt-1.5")}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <FieldError messages={errors.status} />
          </div>

          <div>
            <label htmlFor="priority" className={labelClasses}>
              Prioritas <span className="text-rose-500">*</span>
            </label>
            <select
              id="priority"
              name="priority"
              defaultValue={initial.priority}
              className={cn(inputClasses, "mt-1.5")}
            >
              {PRIORITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <FieldError messages={errors.priority} />
          </div>

          <div>
            <label htmlFor="startDate" className={labelClasses}>
              Tanggal Mulai <span className="text-rose-500">*</span>
            </label>
            <input
              id="startDate"
              name="startDate"
              type="date"
              required
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className={cn(inputClasses, "mt-1.5")}
            />
            <FieldError messages={errors.startDate} />
          </div>

          <div>
            <label htmlFor="deadline" className={labelClasses}>
              Deadline <span className="text-rose-500">*</span>
            </label>
            <input
              id="deadline"
              name="deadline"
              type="date"
              required
              min={startDate || undefined}
              value={deadline}
              onChange={(event) => setDeadline(event.target.value)}
              className={cn(inputClasses, "mt-1.5")}
            />
            <FieldError messages={errors.deadline} />
          </div>
        </div>

        {startDate && deadline ? (
          <p
            className={cn(
              "mt-3 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-medium ring-1 ring-inset",
              deadline < startDate
                ? "bg-rose-50 text-rose-700 ring-rose-200"
                : "bg-slate-50 text-slate-600 ring-slate-200",
            )}
          >
            <CalendarClock className="size-3" />
            {deadline < startDate
              ? "Deadline lebih awal dari tanggal mulai"
              : `Durasi ${Math.round(
                  (new Date(deadline).getTime() - new Date(startDate).getTime()) /
                    (1000 * 60 * 60 * 24),
                )} hari`}
          </p>
        ) : null}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-2">
          <Users className="size-4 text-indigo-500" />
          <h2 className="text-sm font-semibold text-slate-900">Penugasan Tim</h2>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Tetapkan analyst utama dan backup untuk antisipasi ketersediaan.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="primaryAnalystId" className={labelClasses}>
              <span className="inline-flex items-center gap-1.5">
                <UserRound className="size-3.5 text-slate-400" />
                Analyst Utama
              </span>
            </label>
            <select
              id="primaryAnalystId"
              name="primaryAnalystId"
              value={primaryAnalystId}
              onChange={(event) => {
                const next = event.target.value;
                setPrimaryAnalystId(next);
                if (next && next === backupAnalystId) {
                  setBackupAnalystId("");
                }
              }}
              className={cn(inputClasses, "mt-1.5")}
            >
              <option value="">Belum ditugaskan</option>
              {analysts.map((analyst) => (
                <option key={analyst.id} value={analyst.id}>
                  {analyst.name} · {analyst.activeTaskCount} tugas aktif
                </option>
              ))}
            </select>
            <FieldError messages={errors.primaryAnalystId} />
          </div>

          <div>
            <label htmlFor="backupAnalystId" className={labelClasses}>
              <span className="inline-flex items-center gap-1.5">
                <Users className="size-3.5 text-slate-400" />
                Backup Analyst
              </span>
            </label>
            <select
              id="backupAnalystId"
              name="backupAnalystId"
              value={backupAnalystId}
              onChange={(event) => setBackupAnalystId(event.target.value)}
              className={cn(inputClasses, "mt-1.5")}
            >
              <option value="">Tanpa backup</option>
              {analysts
                .filter((analyst) => analyst.id !== primaryAnalystId)
                .map((analyst) => (
                  <option key={analyst.id} value={analyst.id}>
                    {analyst.name} · {analyst.availabilityNote ?? analyst.availability}
                  </option>
                ))}
            </select>
            <FieldError messages={errors.backupAnalystId} />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-sm font-semibold text-slate-900">Kategori</h2>
        <p className="mt-1 text-xs text-slate-500">
          Pilih 1–5 kategori yang paling menggambarkan topik ini.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <label
              key={category.id}
              className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50/40 has-[:checked]:border-indigo-300 has-[:checked]:bg-indigo-50"
            >
              <input
                type="checkbox"
                name="categoryIds"
                value={category.id}
                defaultChecked={initial.categoryIds.includes(category.id)}
                className="size-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="flex items-center gap-2">
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                {category.name}
              </span>
            </label>
          ))}
        </div>
        <FieldError messages={errors.categoryIds} />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Link2 className="size-4 text-sky-500" />
              <h2 className="text-sm font-semibold text-slate-900">Referensi Awal</h2>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Opsional. Maksimal 5 referensi. Wajib berupa URL http/https.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              setReferences((current) =>
                current.length >= 5
                  ? current
                  : [
                      ...current,
                      { key: makeKey(), title: "", url: "", sourceType: "NEWS" },
                    ],
              )
            }
            disabled={references.length >= 5}
            className={buttonClasses({ variant: "secondary", size: "sm" })}
          >
            <Plus className="size-3.5" />
            Tambah
          </button>
        </div>

        <input
          type="hidden"
          name="referencesJson"
          value={JSON.stringify(validReferences)}
        />

        {references.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-6 text-center text-xs text-slate-500">
            Belum ada referensi. Klik “Tambah” untuk menambahkan sumber awal.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {references.map((reference, index) => (
              <div
                key={reference.key}
                className="rounded-xl border border-slate-200 bg-slate-50/40 p-3"
              >
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Referensi {index + 1}
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      setReferences((current) =>
                        current.filter((item) => item.key !== reference.key),
                      )
                    }
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-600 hover:text-rose-500"
                  >
                    <Trash2 className="size-3.5" />
                    Hapus
                  </button>
                </div>
                <div className="grid gap-2 sm:grid-cols-[1.2fr_1.4fr_0.8fr]">
                  <input
                    type="text"
                    value={reference.title}
                    onChange={(event) =>
                      updateReference(reference.key, { title: event.target.value })
                    }
                    placeholder="Judul sumber"
                    className={inputClasses}
                    aria-label={`Judul referensi ${index + 1}`}
                  />
                  <input
                    type="url"
                    value={reference.url}
                    onChange={(event) =>
                      updateReference(reference.key, { url: event.target.value })
                    }
                    placeholder="https://..."
                    className={inputClasses}
                    aria-label={`URL referensi ${index + 1}`}
                  />
                  <select
                    value={reference.sourceType}
                    onChange={(event) =>
                      updateReference(reference.key, {
                        sourceType: event.target.value as ReferenceSourceValue,
                      })
                    }
                    className={inputClasses}
                    aria-label={`Jenis sumber referensi ${index + 1}`}
                  >
                    {REFERENCE_SOURCE_VALUES.map((value) => (
                      <option key={value} value={value}>
                        {REFERENCE_SOURCE_LABELS[value]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
        <FieldError messages={errors.references} />
      </section>

      <div className="sticky bottom-0 z-10 -mx-4 border-t border-slate-200 bg-white/90 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border sm:px-5 sm:shadow-sm">
        <div className="flex flex-col-reverse items-stretch gap-2 sm:flex-row sm:items-center sm:justify-end">
          <Link
            href={cancelHref}
            className={buttonClasses({ variant: "secondary", size: "lg" })}
          >
            Batal
          </Link>
          <SubmitButton label={submitLabel} />
        </div>
      </div>
    </form>
  );
}
