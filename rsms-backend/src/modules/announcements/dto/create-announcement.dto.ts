import { z } from 'zod';
import { AnnouncementScope } from '../../../common/enums';

export const CreateAnnouncementSchema = z.object({
  title: z.string().min(3).max(150),
  body: z.string().min(3).max(5000),
  scope: z.nativeEnum(AnnouncementScope),
  attachmentUrl: z.string().url().optional(),
  targets: z
    .array(
      z.object({
        blockId: z
          .string()
          .regex(/^BLK-\d{2,}$/, 'Invalid block ID')
          .optional(),
        floorNumber: z.number().int().optional(),
      }),
    )
    .optional(),
});

export type CreateAnnouncementDto = z.infer<typeof CreateAnnouncementSchema>;
