import { z } from 'zod';

export const AssignResidentSchema = z.object({
  residentId: z.string().regex(/^RES-\d{2,}$/, 'Invalid resident ID'),
});

export type AssignResidentDto = z.infer<typeof AssignResidentSchema>;
