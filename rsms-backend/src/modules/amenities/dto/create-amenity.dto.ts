import { z } from 'zod';

export const CreateAmenitySchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  capacity: z.number().int().positive().optional(),
  location: z.string().max(100).optional(),
  slots: z
    .array(
      z.object({
        dayOfWeek: z.number().int().min(0).max(6),
        startTime: z.string(),
        endTime: z.string(),
      }),
    )
    .optional(),
});

export type CreateAmenityDto = z.infer<typeof CreateAmenitySchema>;
