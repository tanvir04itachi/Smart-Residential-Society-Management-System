import { z } from 'zod';

export const AssignComplaintSchema = z.object({
  assignedToId: z.string().uuid(),
});

export type AssignComplaintDto = z.infer<typeof AssignComplaintSchema>;
