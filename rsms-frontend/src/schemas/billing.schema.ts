import { z } from 'zod';
import { PaymentMethod } from '@/types';

export const configureBillingSchema = z.object({
  flatType: z.string().min(1, 'Required').max(50),
  baseAmount: z.coerce.number().positive('Must be greater than 0'),
  extraVehicleCharge: z.coerce.number().min(0).default(0),
  commercialSurcharge: z.coerce.number().min(0).default(0),
  latePenaltyPercent: z.coerce.number().min(0).max(100).default(2),
  billingDay: z.coerce.number().int().min(1).max(28).default(1),
});
export type ConfigureBillingFormValues = z.infer<typeof configureBillingSchema>;
export type ConfigureBillingFormInput = z.input<typeof configureBillingSchema>;

export const generateBillsSchema = z.object({
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2000).max(2100),
});
export type GenerateBillsFormValues = z.infer<typeof generateBillsSchema>;
export type GenerateBillsFormInput = z.input<typeof generateBillsSchema>;

export const processPaymentSchema = z.object({
  method: z.nativeEnum(PaymentMethod),
  transactionRef: z.string().min(1, 'Required').max(100),
});
export type ProcessPaymentFormValues = z.infer<typeof processPaymentSchema>;
