import { z } from 'zod';

export const AddNotesSchema = z.object({
  staffNotes: z.string().min(1).max(1000),
});

export type AddNotesDto = z.infer<typeof AddNotesSchema>;
