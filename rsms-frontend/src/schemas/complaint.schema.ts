import { z } from 'zod';
import { ComplaintCategory, ComplaintPriority, ComplaintStatus } from '@/types';

export const createComplaintSchema = z.object({
  title: z.string().min(5, 'Minimum 5 characters').max(100),
  description: z.string().min(10, 'Minimum 10 characters').max(1000),
  category: z.nativeEnum(ComplaintCategory),
  priority: z.nativeEnum(ComplaintPriority).default(ComplaintPriority.MEDIUM),
});
export type CreateComplaintFormValues = z.infer<typeof createComplaintSchema>;
export type CreateComplaintFormInput = z.input<typeof createComplaintSchema>;

export const assignComplaintSchema = z.object({
  assignedToId: z.string().min(1, 'Please select a staff member'),
});
export type AssignComplaintFormValues = z.infer<typeof assignComplaintSchema>;

export const updateComplaintStatusSchema = z.object({
  status: z.nativeEnum(ComplaintStatus),
});
export type UpdateComplaintStatusFormValues = z.infer<
  typeof updateComplaintStatusSchema
>;

export const addNotesSchema = z.object({
  staffNotes: z.string().min(1, 'Notes are required').max(1000),
});
export type AddNotesFormValues = z.infer<typeof addNotesSchema>;
