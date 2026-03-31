import { Activity, Lead, Task, TeamTarget, User, UserTarget } from './types';

export const MOCK_USERS: User[] = [
  
];

export const MOCK_LEADS: Lead[] = [
  {
    id: 'l1',
    name: 'Vikram Malhotra',
    phone: '+91 9876543210',
    email: 'vikram.m@techcorp.com',
    designation: 'CTO',
    industry: 'Information Technology',
    source: 'LinkedIn',
    value: 500000,
    stage: 'PROPOSAL_SHARED',
    remarks: 'Interested in enterprise license.',
    assignedToId: 'u4',
    teamId: 't1',
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-22T14:30:00Z',
    nextFollowUp: '2024-03-25T11:00:00Z'
  },
  {
    id: 'l2',
    name: 'Ananya Sharma',
    phone: '+91 8887776665',
    email: 'ananya.s@greenenergy.in',
    designation: 'Operations Manager',
    industry: 'Renewable Energy',
    source: 'Website',
    value: 1200000,
    stage: 'MEETING_SCHEDULED',
    remarks: 'Wants to discuss bulk mapping.',
    assignedToId: 'u4',
    teamId: 't1',
    createdAt: '2024-03-21T09:15:00Z',
    updatedAt: '2024-03-21T09:15:00Z',
    nextFollowUp: '2024-03-20T15:00:00Z' // Overdue
  },
  {
    id: 'l3',
    name: 'Rajesh Khanna',
    phone: '+91 7776665554',
    email: 'rajesh.k@globallogistics.com',
    designation: 'Director',
    industry: 'Logistics',
    source: 'Referral',
    value: 350000,
    stage: 'YET_TO_CALL',
    remarks: 'Referred by existing client.',
    assignedToId: 'u5',
    teamId: 't1',
    createdAt: '2024-03-23T11:20:00Z',
    updatedAt: '2024-03-23T11:20:00Z'
  },
  {
    id: 'l4',
    name: 'Siddharth Varma',
    phone: '+91 9990001112',
    email: 'siddharth.v@finsafe.com',
    designation: 'VP Engineering',
    industry: 'Banking',
    source: 'Cold Call',
    value: 2500000,
    stage: 'YET_TO_CALL',
    remarks: 'Initial pitch done. Positive response.',
    assignedToId: 'u4',
    teamId: 't1',
    createdAt: '2024-03-18T16:45:00Z',
    updatedAt: '2024-03-19T10:00:00Z',
    nextFollowUp: '2024-03-24T10:00:00Z'
  },
  {
    id: 'l5',
    name: 'Priya Iyer',
    phone: '+91 6665554443',
    email: 'priya.i@edusmart.edu',
    designation: 'Principal',
    industry: 'Education',
    source: 'Email Campaign',
    value: 150000,
    stage: 'NOT_INTERESTED',
    remarks: 'Budget constraints.',
    assignedToId: 'u5',
    teamId: 't1',
    createdAt: '2024-03-15T12:00:00Z',
    updatedAt: '2024-03-17T09:00:00Z'
  },
  {
    id: 'l6',
    name: 'Karan Mehra',
    phone: '+91 9112223334',
    email: 'karan.m@retailhub.com',
    designation: 'Founder',
    industry: 'Retail',
    source: 'LinkedIn',
    value: 800000,
    stage: 'DNP',
    remarks: 'Meeting postponed to next month.',
    assignedToId: 'u4',
    teamId: 't1',
    createdAt: '2024-03-22T15:00:00Z',
    updatedAt: '2024-03-24T10:00:00Z',
    nextFollowUp: '2024-04-15T10:00:00Z'
  }
];

export const MOCK_ACTIVITIES: Activity[] = [
  { id: 'a1', leadId: 'l1', type: 'NOTE', content: 'Client requested a demo for the split-mapping feature.', createdBy: 'u4', createdAt: '2024-03-20T11:00:00Z' },
  { id: 'a2', leadId: 'l1', type: 'STAGE_CHANGE', content: 'Stage changed from YET_TO_CALL to PROPOSAL_SHARED', createdBy: 'u4', createdAt: '2024-03-22T14:30:00Z' },
  { id: 'a3', leadId: 'l1', type: 'STAGE_CHANGE', content: 'Initial stage: YET_TO_CALL', createdBy: 'u4', createdAt: '2024-03-20T10:00:00Z' },
  { id: 'a4', leadId: 'l1', type: 'STAGE_CHANGE', content: 'Stage changed from YET_TO_CALL to MEETING_SCHEDULED', createdBy: 'u4', createdAt: '2024-03-21T09:00:00Z' },
  { id: 'a5', leadId: 'l2', type: 'STAGE_CHANGE', content: 'Initial stage: YET_TO_CALL', createdBy: 'u4', createdAt: '2024-03-21T09:15:00Z' },
  { id: 'a6', leadId: 'l2', type: 'STAGE_CHANGE', content: 'Stage changed from YET_TO_CALL to CALL_BACK', createdBy: 'u4', createdAt: '2024-03-21T10:00:00Z' },
  { id: 'a7', leadId: 'l2', type: 'STAGE_CHANGE', content: 'Stage changed from CALL_BACK to MEETING_SCHEDULED', createdBy: 'u4', createdAt: '2024-03-21T11:00:00Z' },
  { id: 'a8', leadId: 'l3', type: 'STAGE_CHANGE', content: 'Initial stage: YET_TO_CALL', createdBy: 'u5', createdAt: '2024-03-23T11:20:00Z' },
  { id: 'a9', leadId: 'l4', type: 'STAGE_CHANGE', content: 'Initial stage: YET_TO_CALL', createdBy: 'u4', createdAt: '2024-03-18T16:45:00Z' },
  { id: 'a10', leadId: 'l4', type: 'STAGE_CHANGE', content: 'Stage changed from YET_TO_CALL to DNP', createdBy: 'u4', createdAt: '2024-03-19T10:00:00Z' },
  { id: 'a11', leadId: 'l5', type: 'STAGE_CHANGE', content: 'Initial stage: YET_TO_CALL', createdBy: 'u5', createdAt: '2024-03-15T12:00:00Z' },
  { id: 'a12', leadId: 'l5', type: 'STAGE_CHANGE', content: 'Stage changed from YET_TO_CALL to CALL_BACK', createdBy: 'u5', createdAt: '2024-03-16T10:00:00Z' },
  { id: 'a13', leadId: 'l5', type: 'STAGE_CHANGE', content: 'Stage changed from CALL_BACK to NOT_INTERESTED', createdBy: 'u5', createdAt: '2024-03-17T09:00:00Z' },
];

export const MOCK_TASKS: Task[] = [
  { id: 't1', leadId: 'l1', title: 'Send revised proposal', dueDate: '2024-03-20T10:00:00Z', status: 'PENDING', priority: 'HIGH' }, // Overdue
  { id: 't2', leadId: 'l2', title: 'Prepare presentation deck', dueDate: '2024-03-24T14:00:00Z', status: 'PENDING', priority: 'MEDIUM' },
];

export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  onboardingDate: string;
  amcStatus: 'ACTIVE' | 'EXPIRED' | 'PENDING';
}

export const MOCK_CLIENTS: Client[] = [
  { id: 'c1', name: 'John Smith', company: 'TechCorp Solutions', email: 'john@techcorp.com', phone: '+91 9876543210', onboardingDate: '2024-01-15', amcStatus: 'ACTIVE' },
  { id: 'c2', name: 'Alice Green', company: 'Green Energy Ltd', email: 'alice@greenenergy.in', phone: '+91 8887776665', onboardingDate: '2024-02-20', amcStatus: 'ACTIVE' },
];

export interface Invoice {
  id: string;
  clientId: string;
  amount: number;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  date: string;
  dueDate: string;
}

export const MOCK_INVOICES: Invoice[] = [
  { id: 'inv1', clientId: 'c1', amount: 500000, status: 'PAID', date: '2024-01-20', dueDate: '2024-02-20' },
  { id: 'inv2', clientId: 'c2', amount: 1200000, status: 'PENDING', date: '2024-02-25', dueDate: '2024-03-25' },
];

export const MOCK_DASHBOARD_STATS = {
  revenue: 1700000,
  conversionRate: 24.5,
  leadsByStage: {
    DEFAULT: 4,
    LOST: 2,
    NEW: 12,
    INTERESTED: 8,
    PROPOSAL_SHARED: 5,
    PAYMENT_COMPLETED: 3,
    DNP: 15,
    NOT_INTERESTED: 10
  }
};

export const INITIAL_CUSTOM_FIELDS: any[] = [
  { id: 'cf1', label: 'Preferred Language', type: 'SELECT', options: ['English', 'Hindi', 'Marathi', 'Tamil'], required: false },
];

export const INITIAL_AUDIT_LOGS: any[] = [
  { id: 'log1', userId: 'u1', userName: 'Roshan RS', action: 'LOGIN', entityType: 'USER', details: 'Logged in to the system', timestamp: '2024-03-24T10:00:00Z' },
  { id: 'log2', userId: 'u1', userName: 'Roshan RS', action: 'UPDATE_SETTING', entityType: 'SETTING', details: 'Updated system configuration', timestamp: '2024-03-24T10:05:00Z' },
  { id: 'log3', userId: 'u4', userName: 'Alex Exec', action: 'CREATE_LEAD', entityType: 'LEAD', entityId: 'l1', details: 'Created new lead: Vikram Malhotra', timestamp: '2024-03-20T10:00:00Z' }
];

export const MOCK_USER_TARGETS: UserTarget[] = [
  { id: 'ut1', userId: 'u4', targetValue: 3000000, targetLeads: 10, month: '2024-03' },
  { id: 'ut2', userId: 'u5', targetValue: 2000000, targetLeads: 8, month: '2024-03' },
];

export const MOCK_TEAM_TARGETS: TeamTarget[] = [
  { id: 'tt1', teamId: 't1', targetValue: 10000000, targetLeads: 50, month: '2024-03' },
];

