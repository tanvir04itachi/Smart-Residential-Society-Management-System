import { z } from 'zod';
import { Role } from '@/types';

export const createUserSchema = z.object({
  fullName: z.string().min(2, 'Minimum 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  role: z.nativeEnum(Role),
  phone: z.string().optional().or(z.literal('')),
  password: z
    .string()
    .min(8, 'Minimum 8 characters')
    .max(72)
    .optional()
    .or(z.literal('')),
});
export type CreateUserFormValues = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  fullName: z.string().min(2).max(100).optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
});
export type UpdateUserFormValues = z.infer<typeof updateUserSchema>;
