import { z } from 'zod';

export const BookAmenitySchema = z.object({
  slotId: z.string().uuid(),
  bookingDate: z.string(),
});

export type BookAmenityDto = z.infer<typeof BookAmenitySchema>;
