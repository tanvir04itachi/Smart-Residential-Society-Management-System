import { z } from 'zod';
import { ComplaintStatus } from '../../../common/enums';

export const UpdateComplaintStatusSchema = z.object({
  status: z.nativeEnum(ComplaintStatus),
});

export type UpdateComplaintStatusDto = z.infer<
  typeof UpdateComplaintStatusSchema
>;
