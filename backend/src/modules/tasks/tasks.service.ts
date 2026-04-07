import { TaskRepo } from './tasks.repository';
import { LeadRepo } from '../leads/leads.repository';

export const getTasks = async (leadId: string, user: any) => {
  const lead = await LeadRepo.findById(leadId);
  if (!lead) throw new Error('Lead not found');
  if (user.role === 'BDE' && lead.assignedToId !== user.id) throw new Error('Access denied.');
  if (user.role === 'TEAM_LEAD' && lead.teamId !== user.teamId) throw new Error('Access denied.');

  return TaskRepo.findAll({ leadId });
};

export const createTask = async (data: any, user: any) => {
  const lead = await LeadRepo.findById(data.leadId);
  if (!lead) throw new Error('Lead not found');
  if (user.role === 'BDE' && lead.assignedToId !== user.id) throw new Error('Access denied.');
  if (user.role === 'TEAM_LEAD' && lead.teamId !== user.teamId) throw new Error('Access denied.');

  return TaskRepo.create(data);
};

export const updateTask = async (id: string, data: any, user: any) => {
  const task = await TaskRepo.findById(id);
  if (!task) throw new Error('Task not found');
  
  const lead = await LeadRepo.findById(task.leadId);
  if (!lead) throw new Error('Lead not found');
  if (user.role === 'BDE' && lead.assignedToId !== user.id) throw new Error('Access denied.');
  if (user.role === 'TEAM_LEAD' && lead.teamId !== user.teamId) throw new Error('Access denied.');

  return TaskRepo.update(id, data);
};

export const deleteTask = async (id: string, user: any) => {
  const task = await TaskRepo.findById(id);
  if (!task) throw new Error('Task not found');

  const lead = await LeadRepo.findById(task.leadId);
  if (!lead) throw new Error('Lead not found');
  if (user.role === 'BDE' && lead.assignedToId !== user.id) throw new Error('Access denied.');
  if (user.role === 'TEAM_LEAD' && lead.teamId !== user.teamId) throw new Error('Access denied.');

  return TaskRepo.delete(id);
};
