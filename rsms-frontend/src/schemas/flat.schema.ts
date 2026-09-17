import { z } from 'zod';

export const createBlockSchema = z.object({
  name: z.string().min(1, 'Required').max(50),
  description: z.string().max(500).optional().or(z.literal('')),
});
export type CreateBlockFormValues = z.infer<typeof createBlockSchema>;

export const createFlatSchema = z.object({
  blockId: z.string().min(1, 'Block is required'),
  floorNumber: z.coerce.number().int().min(0),
  flatNumber: z.string().min(1, 'Required').max(20),
  area: z.coerce.number().positive().optional(),
  flatType: z.string().max(50).optional().or(z.literal('')),
});
export type CreateFlatFormValues = z.infer<typeof createFlatSchema>;
export type CreateFlatFormInput = z.input<typeof createFlatSchema>;

export const assignResidentSchema = z.object({
  residentId: z.string().min(1, 'Resident is required'),
});
export type AssignResidentFormValues = z.infer<typeof assignResidentSchema>;
