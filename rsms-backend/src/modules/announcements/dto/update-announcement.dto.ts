import { z } from 'zod';

export const UpdateAnnouncementSchema = z.object({
  title: z.string().min(3).max(150).optional(),
  body: z.string().min(3).max(5000).optional(),
  attachmentUrl: z.string().url().optional(),
});

export type UpdateAnnouncementDto = z.infer<typeof UpdateAnnouncementSchema>;
