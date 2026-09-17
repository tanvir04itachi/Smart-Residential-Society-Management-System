import { z } from 'zod';

export const amenitySlotSchema = z.object({
  dayOfWeek: z.coerce.number().int().min(0).max(6),
  startTime: z.string().min(1, 'Required'),
  endTime: z.string().min(1, 'Required'),
});

export const createAmenitySchema = z.object({
  name: z.string().min(2, 'Minimum 2 characters').max(100),
  description: z.string().max(500).optional().or(z.literal('')),
  capacity: z.coerce.number().int().positive().optional(),
  location: z.string().max(100).optional().or(z.literal('')),
  slots: z.array(amenitySlotSchema).optional(),
});
export type CreateAmenityFormValues = z.infer<typeof createAmenitySchema>;
export type CreateAmenityFormInput = z.input<typeof createAmenitySchema>;

export const updateAmenitySchema = z.object({
  name: z.string().min(2).max(100).optional().or(z.literal('')),
  description: z.string().max(500).optional().or(z.literal('')),
  capacity: z.coerce.number().int().positive().optional(),
  location: z.string().max(100).optional().or(z.literal('')),
  isActive: z.boolean().optional(),
});
export type UpdateAmenityFormValues = z.infer<typeof updateAmenitySchema>;
export type UpdateAmenityFormInput = z.input<typeof updateAmenitySchema>;

export const bookAmenitySchema = z.object({
  slotId: z.string().min(1, 'Please choose a slot'),
  bookingDate: z.string().min(1, 'Required'),
});
export type BookAmenityFormValues = z.infer<typeof bookAmenitySchema>;
