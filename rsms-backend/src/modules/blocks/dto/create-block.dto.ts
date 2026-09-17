import { z } from 'zod';

export const CreateBlockSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().max(500).optional(),
});

export type CreateBlockDto = z.infer<typeof CreateBlockSchema>;
