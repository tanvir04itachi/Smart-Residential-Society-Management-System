import { z } from 'zod';

export const UpdateUserSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  phone: z.string().optional(),
});

export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;
