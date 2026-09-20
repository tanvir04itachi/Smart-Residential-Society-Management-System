import { z } from 'zod';
import { VisitorType } from '../../../common/enums';

export const WalkInVisitorSchema = z.object({
  visitorName: z.string().min(2).max(100),
  phone: z.string().optional(),
  purpose: z.string().max(200).optional(),
  visitorType: z.nativeEnum(VisitorType).default(VisitorType.REGULAR),
  flatId: z.string().regex(/^FLT-\d{2,}$/, 'Invalid flat ID'),
});

export type WalkInVisitorDto = z.infer<typeof WalkInVisitorSchema>;
