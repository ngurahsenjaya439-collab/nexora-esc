import { z } from "zod";

export const availabilitySchema = z.object({
  availability: z.enum(["AVAILABLE", "BUSY_EXAM", "UNAVAILABLE"], {
    error: "Status ketersediaan tidak valid",
  }),
  availabilityNote: z
    .string()
    .trim()
    .max(280, "Catatan ketersediaan maksimal 280 karakter")
    .optional(),
});

export type AvailabilityInput = z.infer<typeof availabilitySchema>;
