import { z } from "zod";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

function isValidDateOnly(value: string): boolean {
  if (!datePattern.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime());
}

const optionalId = z.preprocess(
  (value) => (value === "" || value === null || value === undefined ? undefined : value),
  z.string().uuid("ID tidak valid").optional(),
);

export const referenceInputSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Judul referensi minimal 3 karakter")
    .max(300, "Judul referensi maksimal 300 karakter"),
  url: z
    .string()
    .trim()
    .min(1, "URL referensi wajib diisi")
    .refine((value) => {
      try {
        const url = new URL(value);
        return url.protocol === "http:" || url.protocol === "https:";
      } catch {
        return false;
      }
    }, "URL harus diawali http:// atau https://"),
  sourceType: z.enum(["NEWS", "JOURNAL", "REPORT", "INTERNAL", "OTHER"], {
    error: "Jenis sumber tidak valid",
  }),
});

export const researchTopicSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(5, "Judul riset minimal 5 karakter")
      .max(200, "Judul riset maksimal 200 karakter"),
    description: z
      .string()
      .trim()
      .min(20, "Deskripsi/latar belakang minimal 20 karakter")
      .max(5000, "Deskripsi maksimal 5.000 karakter"),
    objective: z
      .string()
      .trim()
      .max(3000, "Tujuan riset maksimal 3.000 karakter")
      .optional(),
    relevanceNote: z
      .string()
      .trim()
      .max(3000, "Catatan relevansi maksimal 3.000 karakter")
      .optional(),
    status: z.enum(
      ["TO_DO", "IN_PROGRESS", "IN_REVIEW", "REVISION_NEEDED", "DONE"],
      { error: "Status tidak valid" },
    ),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"], {
      error: "Prioritas tidak valid",
    }),
    startDate: z.string().refine(isValidDateOnly, "Tanggal mulai tidak valid"),
    deadline: z.string().refine(isValidDateOnly, "Deadline tidak valid"),
    categoryIds: z
      .array(z.string().uuid("Kategori tidak valid"))
      .min(1, "Pilih minimal satu kategori")
      .max(5, "Maksimal 5 kategori per topik"),
    primaryAnalystId: optionalId,
    backupAnalystId: optionalId,
    references: z
      .array(referenceInputSchema)
      .max(5, "Maksimal 5 referensi awal")
      .optional(),
    version: z.coerce.number().int().positive().optional(),
  })
  .superRefine((data, ctx) => {
    const start = new Date(`${data.startDate}T00:00:00.000Z`);
    const deadline = new Date(`${data.deadline}T00:00:00.000Z`);

    if (deadline.getTime() < start.getTime()) {
      ctx.addIssue({
        code: "custom",
        path: ["deadline"],
        message: "Deadline tidak boleh lebih awal dari tanggal mulai",
      });
    }

    if (
      data.primaryAnalystId &&
      data.backupAnalystId &&
      data.primaryAnalystId === data.backupAnalystId
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["backupAnalystId"],
        message: "Backup analyst harus berbeda dari analyst utama",
      });
    }
  });

export type ResearchTopicInput = z.infer<typeof researchTopicSchema>;
export type ReferenceInput = z.infer<typeof referenceInputSchema>;
