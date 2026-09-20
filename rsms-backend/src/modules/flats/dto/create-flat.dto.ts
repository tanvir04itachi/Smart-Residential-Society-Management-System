import { z } from 'zod';

export const CreateFlatSchema = z.object({
  blockId: z.string().regex(/^BLK-\d{2,}$/, 'Invalid block ID'),
  floorNumber: z.number().int().min(0),
  flatNumber: z.string().min(1).max(20),
  area: z.number().positive().optional(),
  flatType: z.string().max(50).optional(),
});

export type CreateFlatDto = z.infer<typeof CreateFlatSchema>;
