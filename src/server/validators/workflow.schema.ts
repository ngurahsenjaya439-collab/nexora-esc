import { z } from "zod";

export const statusChangeSchema = z.object({
  toStatus: z.enum(
    [
      "TO_DO",
      "IN_PROGRESS",
      "IN_REVIEW",
      "REVISION_NEEDED",
      "DONE",
      "ARCHIVED",
    ],
    { error: "Status tujuan tidak valid" },
  ),
  note: z
    .string()
    .trim()
    .max(500, "Catatan status maksimal 500 karakter")
    .optional(),
});

export type StatusChangeInput = z.infer<typeof statusChangeSchema>;

export const dodToggleSchema = z.object({
  itemId: z.string().uuid("Item checklist tidak valid"),
  checked: z.boolean(),
});

export const resolveRevisionNoteSchema = z.object({
  noteId: z.string().uuid("Catatan revisi tidak valid"),
  resolved: z.boolean(),
});
