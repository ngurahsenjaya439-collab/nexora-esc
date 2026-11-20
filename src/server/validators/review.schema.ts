import { z } from "zod";

import {
  REVISION_SEVERITY_VALUES,
  type RevisionSeverityValue,
} from "@/lib/constants";
import { REVISION_SECTION_VALUES } from "@/lib/research-workflow";

export const revisionNoteInputSchema = z.object({
  section: z.enum(REVISION_SECTION_VALUES, {
    error: "Bagian revisi tidak valid",
  }),
  note: z
    .string()
    .trim()
    .min(10, "Catatan revisi minimal 10 karakter")
    .max(1500, "Catatan revisi maksimal 1.500 karakter"),
  severity: z.enum(REVISION_SEVERITY_VALUES, {
    error: "Tingkat keparahan tidak valid",
  }),
});

export type RevisionNoteInput = z.infer<typeof revisionNoteInputSchema>;

export const researchReviewSchema = z.discriminatedUnion("decision", [
  z.object({
    decision: z.literal("APPROVED"),
    summary: z
      .string()
      .trim()
      .max(3000, "Ringkasan review maksimal 3.000 karakter")
      .optional(),
  }),
  z.object({
    decision: z.literal("REVISION_REQUESTED"),
    summary: z
      .string()
      .trim()
      .max(3000, "Ringkasan review maksimal 3.000 karakter")
      .optional(),
    revisionNotes: z
      .array(revisionNoteInputSchema)
      .min(1, "Minimal satu catatan revisi terstruktur")
      .max(10, "Maksimal 10 catatan revisi per review"),
  }),
]);

export type ResearchReviewInput = z.infer<typeof researchReviewSchema>;

export const reviewDecisionValues = [
  "APPROVED",
  "REVISION_REQUESTED",
] as const;

export type ReviewDecisionValue = (typeof reviewDecisionValues)[number];

export function isRevisionSeverity(
  value: string,
): value is RevisionSeverityValue {
  return (REVISION_SEVERITY_VALUES as readonly string[]).includes(value);
}
