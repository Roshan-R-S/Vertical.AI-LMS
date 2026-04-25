import { z } from 'zod';

export const ClientCreateSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  contactName: z.string().min(2, "Contact name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  industry: z.string().optional(),
  products: z.array(z.string()).optional(),
  orderValue: z.number().nonnegative().optional(),
  contractDuration: z.string().optional(),
  startDate: z.string().optional().or(z.null()),
  renewalDate: z.string().optional().or(z.null()),
  status: z.enum(['active', 'inactive', 'renewal_due', 'suspended']).optional(),
  accountManagerId: z.string().optional(),
  linkedLeadId: z.string().optional(),
});

export const ClientUpdateSchema = ClientCreateSchema.partial();
