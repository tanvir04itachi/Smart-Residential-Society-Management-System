import { z } from 'zod';

export const BookAmenitySchema = z.object({
  slotId: z.string().regex(/^AMS-\d{2,}$/, 'Invalid amenity slot ID'),
  bookingDate: z.string(),
});

export type BookAmenityDto = z.infer<typeof BookAmenitySchema>;
