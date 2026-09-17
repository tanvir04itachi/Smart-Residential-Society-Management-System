import { z } from 'zod';

export const UpdateAmenitySchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional(),
  capacity: z.number().int().positive().optional(),
  location: z.string().max(100).optional(),
  isActive: z.boolean().optional(),
});

export type UpdateAmenityDto = z.infer<typeof UpdateAmenitySchema>;
