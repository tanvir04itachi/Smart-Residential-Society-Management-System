import { z } from 'zod';

export const VerifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
});

export type VerifyOtpDto = z.infer<typeof VerifyOtpSchema>;
