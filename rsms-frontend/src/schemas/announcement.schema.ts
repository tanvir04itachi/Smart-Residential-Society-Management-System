import { z } from 'zod';
import { AnnouncementScope } from '@/types';

export const createAnnouncementSchema = z.object({
  title: z.string().min(3, 'Minimum 3 characters').max(150),
  body: z.string().min(3, 'Minimum 3 characters').max(5000),
  scope: z.nativeEnum(AnnouncementScope),
  attachmentUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  targetBlockId: z.string().optional().or(z.literal('')),
  targetFloorNumber: z.coerce.number().int().optional(),
});
export type CreateAnnouncementFormValues = z.infer<
  typeof createAnnouncementSchema
>;
export type CreateAnnouncementFormInput = z.input<
  typeof createAnnouncementSchema
>;

export const updateAnnouncementSchema = z.object({
  title: z.string().min(3).max(150).optional().or(z.literal('')),
  body: z.string().min(3).max(5000).optional().or(z.literal('')),
  attachmentUrl: z.string().url().optional().or(z.literal('')),
});
export type UpdateAnnouncementFormValues = z.infer<
  typeof updateAnnouncementSchema
>;
