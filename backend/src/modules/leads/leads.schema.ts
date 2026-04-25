import { z } from 'zod';

export const LeadCreateSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  contactName: z.string().min(2, "Contact name must be at least 2 characters"),
  email: z.string().email("Invalid email address").optional().or(z.literal('')),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  source: z.string().optional(),
  industry: z.string().optional(),
  value: z.number().nonnegative("Value must be a positive number").optional(),
  priority: z.enum(['Low', 'Medium', 'High']).optional(),
  notes: z.string().optional(),
  milestoneId: z.string().optional(),
  assignedToId: z.string().optional(),
});

export const LeadUpdateSchema = LeadCreateSchema.partial();
