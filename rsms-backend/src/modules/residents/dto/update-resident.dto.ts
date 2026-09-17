import { z } from 'zod';

export const UpdateResidentSchema = z.object({
  emergencyContact: z.string().optional(),
  familyMembers: z.array(z.record(z.string(), z.any())).optional(),
  isActive: z.boolean().optional(),
});

export type UpdateResidentDto = z.infer<typeof UpdateResidentSchema>;
