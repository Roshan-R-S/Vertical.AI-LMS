import { z } from 'zod';

export const createTaskSchema = z.object({
  leadId: z.string().min(1),
  title: z.string().min(1),
  dueDate: z.string().datetime(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  reminderAt: z.string().datetime().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  dueDate: z.string().datetime().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  status: z.enum(['PENDING', 'COMPLETED']).optional(),
  reminderAt: z.string().datetime().optional(),
});
