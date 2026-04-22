export type Role = 'SUPER_ADMIN' | 'SALES_HEAD' | 'TEAM_LEAD' | 'BDE' | 'CHANNEL_PARTNER';

export type LeadStage = 
  | 'DEFAULT'
  | 'LOST'
  | 'YET_TO_CALL'
  | 'NOT_INTERESTED'
  | 'DNP'
  | 'CALL_BACK'
  | 'DND'
  | 'SWITCHED_OFF'
  | 'MEETING_SCHEDULED'
  | 'MEETING_COMPLETED'
  | 'MEETING_POSTPONED'
  | 'PROPOSAL_SHARED'
  | 'HANDED_OVER'
  | 'PAYMENT_COMPLETED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  teamId?: string;
  avatar?: string;
  canBulkUpload: boolean;
  mustResetPassword?: boolean;
  username?: string;
  phone?: string;
  profession?: string;
  notifyEmail: boolean;
  notifyPush: boolean;
  notifyTasks: boolean;
  notifyAssignments: boolean;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  designation: string;
  industry: string;
  source: string;
  value: number;
  stage: LeadStage;
  remarks?: string;
  linkedIn?: string;
  location?: string;
  companyName?: string;
  companyLocation?: string;
  companyWebsite?: string;
  product?: string;
  state?: string;
  city?: string;
  assignedToId: string;
  teamId: string;
  createdAt: string;
  updatedAt: string;
  lastFollowUp?: string;
  nextFollowUp?: string;
  customFields?: Record<string, any>;
  callType?: string;
}

export interface CustomFieldDefinition {
  id: string;
  label: string;
  type: 'TEXT' | 'NUMBER' | 'DATE' | 'SELECT';
  options?: string[];
  required: boolean;
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entityType: 'LEAD' | 'USER' | 'SETTING' | 'TASK' | 'CLIENT';
  entityId?: string;
  details: string;
  timestamp: string;
}

export interface Activity {
  id: string;
  leadId: string;
  type: 'NOTE' | 'TASK' | 'ATTACHMENT' | 'STAGE_CHANGE' | 'LEAD_CREATED';
  content: string;
  createdBy: string;
  createdAt: string;
  metadata?: any;
}

export interface Task {
  id: string;
  leadId: string;
  title: string;
  dueDate: string;
  reminderAt?: string;
  status: 'PENDING' | 'COMPLETED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface UserTarget {
  id: string;
  userId: string;
  targetValue: number;
  targetLeads: number;
  month: string;
}

export interface TeamTarget {
  id: string;
  teamId: string;
  targetValue: number;
  targetLeads: number;
  month: string;
}

export const STAGE_CONFIG: Record<LeadStage, { label: string; color: string }> = {
  DEFAULT: { label: 'Overdue', color: 'bg-rose-100 text-rose-700' },
  LOST: { label: 'Lost', color: 'bg-red-100 text-red-700' },
  YET_TO_CALL: { label: 'Yet to Call', color: 'bg-slate-100 text-slate-700' },
  NOT_INTERESTED: { label: 'Not Interested', color: 'bg-red-100 text-red-700' },
  DNP: { label: 'DNP', color: 'bg-amber-100 text-amber-700' },
  CALL_BACK: { label: 'Call Back', color: 'bg-cyan-100 text-cyan-700' },
  DND: { label: 'DND', color: 'bg-gray-100 text-gray-700' },
  SWITCHED_OFF: { label: 'Switched Off', color: 'bg-zinc-100 text-zinc-700' },
  MEETING_SCHEDULED: { label: 'Meeting Scheduled', color: 'bg-purple-100 text-purple-700' },
  MEETING_COMPLETED: { label: 'Meeting Completed', color: 'bg-emerald-100 text-emerald-700' },
  MEETING_POSTPONED: { label: 'Meeting Postponed', color: 'bg-orange-100 text-orange-700' },
  PROPOSAL_SHARED: { label: 'Proposal Shared', color: 'bg-indigo-100 text-indigo-700' },
  HANDED_OVER: { label: 'Handed Over', color: 'bg-teal-100 text-teal-700' },
  PAYMENT_COMPLETED: { label: 'Payment Completed', color: 'bg-green-100 text-green-700' },
};

export const VALID_TRANSITIONS: Record<LeadStage, LeadStage[]> = {
  DEFAULT: ['YET_TO_CALL', 'MEETING_SCHEDULED', 'CALL_BACK', 'NOT_INTERESTED', 'LOST'],
  LOST: ['YET_TO_CALL', 'DEFAULT'],
  YET_TO_CALL: ['MEETING_SCHEDULED', 'CALL_BACK', 'DNP', 'SWITCHED_OFF', 'NOT_INTERESTED', 'DND', 'DEFAULT', 'LOST'],
  MEETING_SCHEDULED: ['MEETING_COMPLETED', 'PROPOSAL_SHARED', 'NOT_INTERESTED', 'CALL_BACK', 'DNP', 'MEETING_POSTPONED', 'DEFAULT', 'LOST'],
  MEETING_COMPLETED: ['PROPOSAL_SHARED', 'NOT_INTERESTED', 'CALL_BACK', 'DEFAULT', 'LOST'],
  MEETING_POSTPONED: ['MEETING_SCHEDULED', 'NOT_INTERESTED', 'CALL_BACK', 'DEFAULT', 'LOST'],
  PROPOSAL_SHARED: ['PAYMENT_COMPLETED', 'NOT_INTERESTED', 'CALL_BACK', 'DEFAULT', 'LOST'],
  PAYMENT_COMPLETED: ['HANDED_OVER', 'DEFAULT', 'LOST'],
  HANDED_OVER: ['DEFAULT', 'LOST'],
  NOT_INTERESTED: ['MEETING_SCHEDULED', 'CALL_BACK', 'DEFAULT', 'LOST'], // Allow re-engagement
  DNP: ['MEETING_SCHEDULED', 'CALL_BACK', 'SWITCHED_OFF', 'DEFAULT', 'LOST'],
  CALL_BACK: ['MEETING_SCHEDULED', 'PROPOSAL_SHARED', 'DNP', 'NOT_INTERESTED', 'DEFAULT', 'LOST'],
  DND: ['DEFAULT', 'LOST'],
  SWITCHED_OFF: ['DNP', 'CALL_BACK', 'DEFAULT', 'LOST'],
};

export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  onboardingDate: string;
  amcStatus: 'ACTIVE' | 'EXPIRED' | 'PENDING';
}

export interface Invoice {
  id: string;
  clientId: string;
  amount: number;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  date: string;
  dueDate: string;
  client?: Client;
}
