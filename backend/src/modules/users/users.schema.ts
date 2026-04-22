import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['SUPER_ADMIN', 'SALES_HEAD', 'TEAM_LEAD', 'BDE']),
  teamId: z.string().optional(),
  avatar: z.string().optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  teamId: z.string().optional(),
  avatar: z.string().optional(),
  isActive: z.union([z.boolean(), z.string().transform(val => val === 'true')]).optional(),
  canBulkUpload: z.union([z.boolean(), z.string().transform(val => val === 'true')]).optional(),
  username: z.string().optional(),
  phone: z.string().optional(),
  profession: z.string().optional(),
  notifyEmail: z.union([z.boolean(), z.string().transform(val => val === 'true')]).optional(),
  notifyPush: z.union([z.boolean(), z.string().transform(val => val === 'true')]).optional(),
  notifyTasks: z.union([z.boolean(), z.string().transform(val => val === 'true')]).optional(),
  notifyAssignments: z.union([z.boolean(), z.string().transform(val => val === 'true')]).optional(),
});
