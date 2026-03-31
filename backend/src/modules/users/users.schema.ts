import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['SUPER_ADMIN', 'SALES_ADMIN', 'TEAM_LEAD', 'BDE']),
  teamId: z.string().optional(),
  avatar: z.string().optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  teamId: z.string().optional(),
  avatar: z.string().optional(),
  isActive: z.boolean().optional(),
  canBulkUpload: z.boolean().optional(),
});