import { Check, RotateCcw } from "lucide-react";

import {
  WORKFLOW_STEPS,
  WORKFLOW_STEP_LABELS,
  type WorkflowStep,
} from "@/lib/research-workflow";
import { cn } from "@/lib/utils";

export function StatusStepper({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  if (status === "ARCHIVED") {
    return (
      <div
        className={cn(
          "rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-medium text-slate-500",
          className,
        )}
      >
        Topik ini telah diarsipkan dan tidak mengikuti alur kerja aktif.
      </div>
    );
  }

  const isRevision = status === "REVISION_NEEDED";
  const currentIndex = isRevision
    ? WORKFLOW_STEPS.indexOf("IN_PROGRESS")
    : WORKFLOW_STEPS.indexOf(status as WorkflowStep);

  return (
    <div className={className}>
      {isRevision ? (
        <div className="mb-3 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
          <RotateCcw className="size-3.5" />
          Revisi diminta Manager — perbaiki catatan lalu kirim ulang hasil riset.
        </div>
      ) : null}

      <ol className="flex items-start gap-1">
        {WORKFLOW_STEPS.map((step, index) => {
          const isComplete =
            currentIndex >= 0 &&
            (index < currentIndex || (status === "DONE" && index <= currentIndex));
          const isCurrent =
            !isComplete && (currentIndex === index || currentIndex < 0);

          return (
            <li key={step} className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-center">
                <span
                  className={cn(
                    "grid size-7 shrink-0 place-items-center rounded-full text-[10px] font-semibold ring-1 ring-inset transition",
                    isComplete
                      ? "bg-emerald-500 text-white ring-emerald-500"
                      : isCurrent
                        ? isRevision && step === "IN_PROGRESS"
                          ? "bg-amber-500 text-white ring-amber-500"
                          : "bg-indigo-600 text-white ring-indigo-600"
                        : "bg-white text-slate-400 ring-slate-200",
                  )}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  {isComplete ? <Check className="size-3.5" /> : index + 1}
                </span>
                {index < WORKFLOW_STEPS.length - 1 ? (
                  <span
                    className={cn(
                      "mx-1 h-0.5 flex-1 rounded-full",
                      isComplete ? "bg-emerald-400" : "bg-slate-200",
                    )}
                  />
                ) : null}
              </div>
              <span
                className={cn(
                  "mt-1.5 truncate text-[10px] font-medium sm:text-[11px]",
                  isCurrent
                    ? isRevision && step === "IN_PROGRESS"
                      ? "text-amber-700"
                      : "text-indigo-700"
                    : isComplete
                      ? "text-emerald-700"
                      : "text-slate-400",
                )}
              >
                {WORKFLOW_STEP_LABELS[step]}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
