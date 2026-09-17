import { z } from 'zod';
import { VisitorType } from '@/types';

export const preRegisterVisitorSchema = z.object({
  visitorName: z.string().min(2, 'Minimum 2 characters').max(100),
  phone: z.string().optional().or(z.literal('')),
  purpose: z.string().max(200).optional().or(z.literal('')),
  visitorType: z.nativeEnum(VisitorType).default(VisitorType.REGULAR),
  expectedArrival: z.string().optional().or(z.literal('')),
});
export type PreRegisterVisitorFormValues = z.infer<
  typeof preRegisterVisitorSchema
>;
export type PreRegisterVisitorFormInput = z.input<
  typeof preRegisterVisitorSchema
>;

export const walkInVisitorSchema = z.object({
  visitorName: z.string().min(2, 'Minimum 2 characters').max(100),
  phone: z.string().optional().or(z.literal('')),
  purpose: z.string().max(200).optional().or(z.literal('')),
  visitorType: z.nativeEnum(VisitorType).default(VisitorType.REGULAR),
  flatId: z.string().min(1, 'Flat is required'),
});
export type WalkInVisitorFormValues = z.infer<typeof walkInVisitorSchema>;
export type WalkInVisitorFormInput = z.input<typeof walkInVisitorSchema>;

export const flagVisitorSchema = z.object({
  reason: z.string().max(500).optional().or(z.literal('')),
});
export type FlagVisitorFormValues = z.infer<typeof flagVisitorSchema>;
