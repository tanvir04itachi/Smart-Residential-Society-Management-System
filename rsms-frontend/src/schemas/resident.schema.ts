import { z } from 'zod';
import { ResidentType } from '@/types';

export const createResidentSchema = z.object({
  fullName: z.string().min(2, 'Minimum 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional().or(z.literal('')),
  password: z
    .string()
    .min(8, 'Minimum 8 characters')
    .max(72)
    .optional()
    .or(z.literal('')),
  flatId: z.string().optional().or(z.literal('')),
  type: z.nativeEnum(ResidentType),
  emergencyContact: z.string().optional().or(z.literal('')),
  moveInDate: z.string().optional().or(z.literal('')),
});
export type CreateResidentFormValues = z.infer<typeof createResidentSchema>;

export const updateResidentSchema = z.object({
  emergencyContact: z.string().optional().or(z.literal('')),
  isActive: z.boolean().optional(),
});
export type UpdateResidentFormValues = z.infer<typeof updateResidentSchema>;
