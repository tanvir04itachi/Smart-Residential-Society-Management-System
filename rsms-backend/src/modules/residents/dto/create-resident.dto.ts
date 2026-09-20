import { z } from 'zod';
import { ResidentType } from '../../../common/enums';

export const CreateResidentSchema = z.object({
  fullName: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(8).max(72).optional(),
  flatId: z
    .string()
    .regex(/^FLT-\d{2,}$/, 'Invalid flat ID')
    .optional(),
  type: z.nativeEnum(ResidentType),
  emergencyContact: z.string().optional(),
  familyMembers: z.array(z.record(z.string(), z.any())).optional(),
  moveInDate: z.string().optional(),
});

export type CreateResidentDto = z.infer<typeof CreateResidentSchema>;
