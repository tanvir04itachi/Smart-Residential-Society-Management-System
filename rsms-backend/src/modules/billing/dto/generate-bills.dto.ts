import { z } from 'zod';

export const GenerateBillsSchema = z.object({
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000).max(2100),
});

export type GenerateBillsDto = z.infer<typeof GenerateBillsSchema>;
