import { z } from 'zod';
import { ComplaintCategory, ComplaintPriority } from '../../../common/enums';

export const CreateComplaintSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(10).max(1000),
  category: z.nativeEnum(ComplaintCategory),
  priority: z.nativeEnum(ComplaintPriority).default(ComplaintPriority.MEDIUM),
});

export type CreateComplaintDto = z.infer<typeof CreateComplaintSchema>;
