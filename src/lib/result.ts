import type { ZodError } from "zod";

export type FieldErrors = Record<string, string[]>;

export type ActionState = {
  ok: boolean;
  message?: string;
  fieldErrors?: FieldErrors;
};

export const initialActionState: ActionState = { ok: false };

export function fieldErrorsFromZod(error: ZodError): FieldErrors {
  const errors: FieldErrors = {};

  for (const issue of error.issues) {
    const key = issue.path[0]?.toString() ?? "form";
    errors[key] = [...(errors[key] ?? []), issue.message];
  }

  return errors;
}

export function firstFieldError(
  errors: FieldErrors | undefined,
  key: string,
): string | undefined {
  return errors?.[key]?.[0];
}
