import { LeadStage } from '@prisma/client';
import { LeadRepo } from './leads.repository';

export const getLeads = async (query: any, user: any) => {
  const { stage, assignedToId, teamId, search, industry, source, page = 1, limit = 20 } = query;
  const skip = (Number(page) - 1) * Number(limit);

  // Scope filter: role-based enforcement (who can see what)
  const scopeFilter: any = {};
  if (user.role === 'BDE') {
    scopeFilter.assignedToId = user.id;
  } else if (user.role === 'TEAM_LEAD') {
    scopeFilter.teamId = user.teamId;
  } else {
    // Admins honour explicit filters if provided
    if (assignedToId && assignedToId !== 'ALL') scopeFilter.assignedToId = assignedToId;
    if (teamId) scopeFilter.teamId = teamId;
  }

  // Attribute filters (industry / source / search / page)
  const attrFilter: any = {
    industry: industry === 'ALL' ? undefined : industry,
    source: source === 'ALL' ? undefined : source,
    search: search || undefined,
  };

  // Full filters for findAll — keep raw stage (repo handles OVERDUE logic)
  const findAllFilters: any = {
    stage: (stage === 'ALL') ? undefined : stage,   // only strip 'ALL'; keep 'OVERDUE' etc.
    ...scopeFilter,
    ...attrFilter,
    skip,
    take: Number(limit),
  };

  // Stats filters — NO stage, so KPI cards always reflect the full accessible dataset
  const statsFilters: any = {
    ...scopeFilter,
    ...attrFilter,
  };

  const [leads, stats] = await Promise.all([
    LeadRepo.findAll(findAllFilters),
    LeadRepo.getStats(statsFilters),
  ]);

  try {
    require('fs').writeFileSync('service_debug.json', JSON.stringify({
      timestamp: new Date().toISOString(),
      stageFilter: query.stage,
      findAllFilters,
      statsFilters,
      returnedTotal: stats.totalLeads,
      stats
    }, null, 2));
  } catch (e) {}

  return {
    data: leads,
    meta: {
      total: stats.totalLeads,
      stats,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(stats.totalLeads / Number(limit)),
    },
  };
};

export const getLeadById = async (id: string) => {
  const lead = await LeadRepo.findById(id);
  if (!lead) throw new Error('Lead not found');
  return lead;
};

export const createLead = async (data: any) => {
  return LeadRepo.create(data);
};

export const bulkCreateLeads = async (data: any[], user: any) => {
  const enrichedData = data.map(lead => ({
    ...lead,
    teamId: lead.teamId || user.teamId || 'default-team',
    assignedToId: lead.assignedToId || user.id,
  }));
  return LeadRepo.createMany(enrichedData);
};

export const updateLead = async (id: string, data: any) => {
  const lead = await LeadRepo.findById(id);
  if (!lead) throw new Error('Lead not found');
  return LeadRepo.update(id, data);
};

export const deleteLead = async (id: string) => {
  const lead = await LeadRepo.findById(id);
  if (!lead) throw new Error('Lead not found');
  return LeadRepo.delete(id);
};

export const updateStage = async (
  id: string,
  stage: LeadStage,
  executorId: string,
  remarks?: string
) => {
  const lead = await LeadRepo.findById(id);
  if (!lead) throw new Error('Lead not found');
  return LeadRepo.updateStage(id, stage, executorId, remarks);
};

export const getActivities = async (leadId: string) => {
  const lead = await LeadRepo.findById(leadId);
  if (!lead) throw new Error('Lead not found');
  return LeadRepo.getActivities(leadId);
};

export const addActivity = async (
  leadId: string,
  type: string,
  content: string,
  createdBy: string
) => {
  const lead = await LeadRepo.findById(leadId);
  if (!lead) throw new Error('Lead not found');
  return LeadRepo.addActivity(leadId, type, content, createdBy);
};