import { z } from 'zod';

export const AssignComplaintSchema = z.object({
  assignedToId: z.string().regex(/^MNT-\d{2,}$/, 'Invalid maintenance user ID'),
});

export type AssignComplaintDto = z.infer<typeof AssignComplaintSchema>;
