"use client";

import { useActionState } from "react";
import { AlertCircle, ArrowRight, Loader2 } from "lucide-react";

import { buttonClasses } from "@/components/ui/button";
import { initialActionState } from "@/lib/result";
import type { StatusAction } from "@/lib/research-workflow";
import { changeStatusAction } from "@/server/actions/workflow.actions";

export function StatusActions({
  topicId,
  actions,
}: {
  topicId: string;
  actions: StatusAction[];
}) {
  const [state, formAction, pending] = useActionState(
    changeStatusAction.bind(null, topicId),
    initialActionState,
  );

  if (actions.length === 0) return null;

  return (
    <form action={formAction} className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        {actions.map((action) => (
          <button
            key={action.toStatus}
            type="submit"
            name="toStatus"
            value={action.toStatus}
            disabled={pending}
            title={action.description}
            className={buttonClasses({
              variant: action.variant,
              size: "sm",
            })}
          >
            {pending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <ArrowRight className="size-3.5" />
            )}
            {action.label}
          </button>
        ))}
      </div>

      {state.message && !state.ok ? (
        <p className="flex items-start gap-1.5 text-xs text-rose-600">
          <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
