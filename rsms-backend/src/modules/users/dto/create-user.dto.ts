import { z } from 'zod';
import { Role } from '../../../common/enums';

export const CreateUserSchema = z.object({
  fullName: z.string().min(2).max(100),
  email: z.string().email(),
  role: z.nativeEnum(Role),
  phone: z.string().optional(),
  password: z.string().min(8).max(72).optional(),
});

export type CreateUserDto = z.infer<typeof CreateUserSchema>;
