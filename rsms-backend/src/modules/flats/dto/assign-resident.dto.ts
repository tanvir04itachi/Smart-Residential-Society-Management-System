import { z } from 'zod';

export const AssignResidentSchema = z.object({
  residentId: z.string().uuid(),
});

export type AssignResidentDto = z.infer<typeof AssignResidentSchema>;
