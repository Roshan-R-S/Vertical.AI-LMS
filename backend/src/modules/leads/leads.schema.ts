import { z } from 'zod';

const nullableString = z.string().nullable().optional();

export const LeadCreateSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  contactName: z.string().min(2, "Contact name must be at least 2 characters"),
  email: z.string().email("Invalid email address").optional().or(z.literal('')).nullable(),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  source: nullableString,
  industry: nullableString,
  value: z.number().nonnegative("Value must be a positive number").optional(),
  priority: z.enum(['Low', 'Medium', 'High']).optional(),
  notes: nullableString,
  milestoneId: nullableString,
  assignedToId: nullableString,
});

export const LeadUpdateSchema = LeadCreateSchema.partial();
