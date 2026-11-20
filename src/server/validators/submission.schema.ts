import { z } from "zod";

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

const httpUrl = z
  .string()
  .trim()
  .min(1, "URL wajib diisi")
  .refine(isHttpUrl, "URL harus diawali http:// atau https://");

export const submissionAttachmentSchema = z.object({
  label: z
    .string()
    .trim()
    .min(3, "Label lampiran minimal 3 karakter")
    .max(160, "Label lampiran maksimal 160 karakter"),
  url: httpUrl,
});

export const researchSubmissionSchema = z.object({
  summary: z
    .string()
    .trim()
    .min(50, "Ringkasan eksekutif minimal 50 karakter")
    .max(10000, "Ringkasan eksekutif maksimal 10.000 karakter"),
  documentUrl: httpUrl,
  attachments: z
    .array(submissionAttachmentSchema)
    .max(5, "Maksimal 5 lampiran tautan pendukung")
    .optional(),
});

export type ResearchSubmissionInput = z.infer<typeof researchSubmissionSchema>;
export type SubmissionAttachmentInput = z.infer<
  typeof submissionAttachmentSchema
>;
