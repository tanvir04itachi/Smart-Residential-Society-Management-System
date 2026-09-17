import { z } from 'zod';
import { PaymentMethod } from '../../../common/enums';

export const ProcessPaymentSchema = z.object({
  method: z.nativeEnum(PaymentMethod),
  transactionRef: z.string().min(1).max(100),
});

export type ProcessPaymentDto = z.infer<typeof ProcessPaymentSchema>;
