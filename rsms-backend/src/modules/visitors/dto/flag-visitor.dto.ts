import { z } from 'zod';

export const FlagVisitorSchema = z.object({
  reason: z.string().min(1).max(500).optional(),
});

export type FlagVisitorDto = z.infer<typeof FlagVisitorSchema>;
