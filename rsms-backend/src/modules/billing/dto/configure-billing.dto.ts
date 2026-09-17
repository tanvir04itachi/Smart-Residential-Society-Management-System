import { z } from 'zod';

export const ConfigureBillingSchema = z.object({
  flatType: z.string().min(1).max(50),
  baseAmount: z.number().positive(),
  extraVehicleCharge: z.number().min(0).default(0),
  commercialSurcharge: z.number().min(0).default(0),
  latePenaltyPercent: z.number().min(0).max(100).default(2),
  billingDay: z.number().int().min(1).max(28).default(1),
});

export type ConfigureBillingDto = z.infer<typeof ConfigureBillingSchema>;
