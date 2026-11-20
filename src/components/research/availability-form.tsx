"use client";

import { useActionState } from "react";
import { AlertCircle, CheckCircle2, Loader2, Save } from "lucide-react";

import { buttonClasses } from "@/components/ui/button";
import {
  AVAILABILITY_META,
  AVAILABILITY_VALUES,
  type AvailabilityValue,
} from "@/lib/constants";
import { initialActionState } from "@/lib/result";
import { cn } from "@/lib/utils";
import { updateAvailabilityAction } from "@/server/actions/availability.actions";

export function AvailabilityForm({
  targetUserId,
  initialAvailability,
  initialNote,
}: {
  targetUserId: string;
  initialAvailability: AvailabilityValue;
  initialNote: string | null;
}) {
  const [state, formAction, pending] = useActionState(
    updateAvailabilityAction.bind(null, targetUserId),
    initialActionState,
  );
  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-2.5">
      <div className="grid gap-2 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.5fr)]">
        <select
          name="availability"
          defaultValue={initialAvailability}
          className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-800 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          aria-label="Status ketersediaan"
        >
          {AVAILABILITY_VALUES.map((value) => (
            <option key={value} value={value}>
              {AVAILABILITY_META[value].label}
            </option>
          ))}
        </select>
        <input
          type="text"
          name="availabilityNote"
          defaultValue={initialNote ?? ""}
          maxLength={280}
          placeholder="Catatan singkat (opsional)"
          className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          aria-label="Catatan ketersediaan"
        />
      </div>

      {errors.availability || errors.availabilityNote ? (
        <p className="flex items-start gap-1.5 text-xs text-rose-600">
          <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
          {errors.availability?.[0] ?? errors.availabilityNote?.[0]}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="submit"
          disabled={pending}
          className={buttonClasses({ variant: "secondary", size: "sm" })}
        >
          {pending ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Save className="size-3.5" />
          )}
          Simpan Ketersediaan
        </button>

        {state.message ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 text-[10px]",
              state.ok ? "text-emerald-600" : "text-rose-600",
            )}
          >
            {state.ok ? (
              <CheckCircle2 className="size-3" />
            ) : (
              <AlertCircle className="size-3" />
            )}
            {state.message}
          </span>
        ) : null}
      </div>
    </form>
  );
}
