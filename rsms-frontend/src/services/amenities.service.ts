import { api } from '@/lib/api';
import type { Amenity, AmenitySlot, Booking } from '@/types';
import type {
  BookAmenityFormValues,
  CreateAmenityFormValues,
  UpdateAmenityFormValues,
} from '@/schemas/amenity.schema';

export const amenitiesService = {
  getAll: () => api.get<Amenity[]>('/amenities').then((r) => r.data),

  create: (dto: CreateAmenityFormValues) =>
    api.post<Amenity>('/amenities', dto).then((r) => r.data),

  update: (id: string, dto: UpdateAmenityFormValues) =>
    api.patch<Amenity>(`/amenities/${id}`, dto).then((r) => r.data),

  getSlots: (id: string) =>
    api.get<AmenitySlot[]>(`/amenities/${id}/slots`).then((r) => r.data),

  book: (id: string, dto: BookAmenityFormValues) =>
    api.post<Booking>(`/amenities/${id}/book`, dto).then((r) => r.data),

  getMyBookings: () =>
    api.get<Booking[]>('/amenities/bookings/my').then((r) => r.data),

  getAllBookings: () =>
    api.get<Booking[]>('/amenities/bookings').then((r) => r.data),

  cancelBooking: (id: string) =>
    api.patch<Booking>(`/amenities/bookings/${id}/cancel`).then((r) => r.data),
};
