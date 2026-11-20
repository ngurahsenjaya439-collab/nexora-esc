"use client";

import { useState, useTransition } from "react";
import {
  AlertCircle,
  Check,
  Circle,
  ListChecks,
  Loader2,
  Sparkles,
} from "lucide-react";

import { ProgressBar } from "@/components/research/progress-bar";
import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  applyDodTemplateAction,
  toggleDodItemAction,
} from "@/server/actions/workflow.actions";

export type DodItemView = {
  id: string;
  label: string;
  description: string | null;
  isRequired: boolean;
  isChecked: boolean;
  checkedByName: string | null;
};

export function DodChecklist({
  topicId,
  items,
  hasChecklist,
  canToggle,
  canApplyTemplate,
  templateName,
  appliedByName,
}: {
  topicId: string;
  items: DodItemView[];
  hasChecklist: boolean;
  canToggle: boolean;
  canApplyTemplate: boolean;
  templateName?: string | null;
  appliedByName?: string | null;
}) {
  const [checkedState, setCheckedState] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(items.map((item) => [item.id, item.isChecked])),
  );
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isApplying, startApply] = useTransition();
  const [, startToggle] = useTransition();

  const checkedCount = items.filter((item) => checkedState[item.id]).length;
  const requiredOpen = items.filter(
    (item) => item.isRequired && !checkedState[item.id],
  ).length;

  const handleToggle = (item: DodItemView) => {
    const next = !checkedState[item.id];
    setError(null);
    setCheckedState((current) => ({ ...current, [item.id]: next }));
    setPendingId(item.id);

    startToggle(async () => {
      const result = await toggleDodItemAction(item.id, next);
      setPendingId(null);
      if (!result.ok) {
        setCheckedState((current) => ({ ...current, [item.id]: !next }));
        setError(result.message ?? "Gagal memperbarui checklist.");
      }
    });
  };

  const handleApply = () => {
    setError(null);
    startApply(async () => {
      const result = await applyDodTemplateAction(topicId);
      if (!result.ok) {
        setError(result.message ?? "Gagal menerapkan template DOD.");
      }
    });
  };

  if (!hasChecklist) {
    return (
      <div className="mt-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-4">
        <div className="flex items-start gap-2.5">
          <ListChecks className="mt-0.5 size-4 shrink-0 text-slate-400" />
          <div>
            <p className="text-xs font-medium text-slate-700">
              Checklist DOD belum diterapkan
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Checklist membantu memastikan kualitas riset sebelum masuk review.
            </p>
          </div>
        </div>

        {canApplyTemplate ? (
          <button
            type="button"
            onClick={handleApply}
            disabled={isApplying}
            className={cn(buttonClasses({ variant: "secondary", size: "sm" }), "mt-3")}
          >
            {isApplying ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Sparkles className="size-3.5" />
            )}
            Terapkan Template DOD
          </button>
        ) : null}

        {error ? (
          <p className="mt-2 flex items-start gap-1.5 text-xs text-rose-600">
            <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
            {error}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between text-[11px] text-slate-500">
        <span>
          {checkedCount}/{items.length} item selesai
        </span>
        {requiredOpen > 0 ? (
          <span className="font-medium text-amber-600">
            {requiredOpen} wajib belum dicentang
          </span>
        ) : (
          <span className="font-medium text-emerald-600">Semua wajib selesai</span>
        )}
      </div>
      <ProgressBar
        value={items.length ? Math.round((checkedCount / items.length) * 100) : 0}
        className="mt-1.5"
        barClassName="bg-emerald-500"
      />

      <ul className="mt-3 space-y-1.5">
        {items.map((item) => {
          const checked = checkedState[item.id] ?? false;
          const isPending = pendingId === item.id;

          return (
            <li key={item.id}>
              <label
                className={cn(
                  "flex items-start gap-2 rounded-lg px-1.5 py-1.5 text-xs transition",
                  canToggle && !isPending
                    ? "cursor-pointer hover:bg-slate-50"
                    : "cursor-default",
                )}
              >
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={checked}
                  disabled={!canToggle || isPending}
                  onChange={() => handleToggle(item)}
                />
                <span
                  className={cn(
                    "mt-0.5 grid size-4 shrink-0 place-items-center rounded border transition",
                    checked
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-slate-300 bg-white text-transparent",
                    isPending && "opacity-60",
                  )}
                  aria-hidden
                >
                  {checked ? <Check className="size-3" /> : <Circle className="size-2" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      "leading-5",
                      checked ? "text-slate-500 line-through" : "text-slate-700",
                    )}
                  >
                    {item.label}
                    {item.isRequired ? (
                      <span className="ml-1 text-rose-500">*</span>
                    ) : null}
                  </span>
                  {checked && item.checkedByName ? (
                    <span className="mt-0.5 block text-[10px] text-slate-400">
                      Dicentang oleh {item.checkedByName}
                    </span>
                  ) : null}
                </span>
              </label>
            </li>
          );
        })}
      </ul>

      {templateName ? (
        <p className="mt-3 border-t border-slate-100 pt-2 text-[10px] leading-4 text-slate-400">
          Template: {templateName}
          {appliedByName ? ` · diterapkan oleh ${appliedByName}` : ""}
        </p>
      ) : null}

      {!canToggle ? (
        <p className="mt-2 text-[10px] leading-4 text-slate-400">
          Checklist dikunci saat review berlangsung. Manager dapat memverifikasi item.
        </p>
      ) : null}

      {error ? (
        <p className="mt-2 flex items-start gap-1.5 text-xs text-rose-600">
          <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
          {error}
        </p>
      ) : null}
    </div>
  );
}
