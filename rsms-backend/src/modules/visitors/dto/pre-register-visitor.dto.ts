import { z } from 'zod';
import { VisitorType } from '../../../common/enums';

export const PreRegisterVisitorSchema = z.object({
  visitorName: z.string().min(2).max(100),
  phone: z.string().optional(),
  purpose: z.string().max(200).optional(),
  visitorType: z.nativeEnum(VisitorType).default(VisitorType.REGULAR),
  expectedArrival: z.string().datetime().optional(),
});

export type PreRegisterVisitorDto = z.infer<typeof PreRegisterVisitorSchema>;
