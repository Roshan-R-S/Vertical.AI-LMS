import { z } from 'zod';

export const createLeadSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email().optional(),
  designation: z.string().optional(),
  industry: z.string().optional(),
  source: z.string().optional(),
  callType: z.string().optional(),
  value: z.number().optional(),
  remarks: z.string().optional(),
  linkedIn: z.string().optional(),
  location: z.string().optional(),
  companyName: z.string().optional(),
  companyWebsite: z.string().optional(),
  product: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  teamId: z.string().min(1),
  assignedToId: z.string().min(1),
  nextFollowUp: z.string().optional(),
});

export const updateLeadSchema = createLeadSchema.partial();

export const updateStageSchema = z.object({
  stage: z.enum([
    'DEFAULT', 'LOST', 'YET_TO_CALL', 'NOT_INTERESTED',
    'DNP', 'CALL_BACK', 'DND', 'SWITCHED_OFF',
    'MEETING_SCHEDULED', 'MEETING_POSTPONED',
    'PROPOSAL_SHARED', 'HANDED_OVER', 'PAYMENT_COMPLETED'
  ]),
  remarks: z.string().optional(),
});

export const createActivitySchema = z.object({
  type: z.enum(['NOTE', 'TASK', 'STAGE_CHANGE', 'ATTACHMENT']),
  content: z.string().min(1),
});
