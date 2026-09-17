import { z } from 'zod';

export const ResetPasswordSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
  newPassword: z.string().min(8).max(72),
});

export type ResetPasswordDto = z.infer<typeof ResetPasswordSchema>;
