import { LeadStage } from '@prisma/client';
import { LeadRepo } from './leads.repository';
import { prisma } from '../../prisma';
import { sendMeetingScheduledEmail } from '../../services/mailer';
import { logAudit } from '../audit-logs/audit-logs.service';

export const getLeads = async (query: any, user: any) => {
  const { stage, assignedToId, teamId, search, industry, source, page = 1, limit = 20 } = query;
  const skip = (Number(page) - 1) * Number(limit);

  // Scope filter: role-based enforcement (who can see what)
  const scopeFilter: any = {};
  if (user.role === 'BDE') {
    scopeFilter.assignedToId = user.id;
  } else if (user.role === 'TEAM_LEAD') {
    scopeFilter.teamId = user.teamId;
  } else if (user.role === 'CHANNEL_PARTNER') {
    // Channel Partners only see leads they uploaded
    scopeFilter.createdById = user.id;
  } else {
    // Admins/Sales Head honour explicit filters if provided
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

  const [leads, stats, filteredTotal] = await Promise.all([
    LeadRepo.findAll(findAllFilters),
    LeadRepo.getStats(statsFilters),
    LeadRepo.count(findAllFilters),
  ]);

  return {
    data: leads,
    meta: {
      total: stats.totalLeads, // Global total for KPI cards
      filteredTotal: filteredTotal, // Total after current filters (stage, etc.)
      stats,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(filteredTotal / Number(limit)),
    },
  };
};

export const getLeadById = async (id: string, user: any) => {
  const lead = await LeadRepo.findById(id);
  if (!lead) throw new Error('Lead not found');

  // Verify access
  if (user.role === 'BDE' && lead.assignedToId !== user.id) {
    throw new Error('Access denied to this lead.');
  }
  if (user.role === 'TEAM_LEAD' && lead.teamId !== user.teamId) {
    throw new Error('Access denied to this lead.');
  }
  if (user.role === 'CHANNEL_PARTNER' && lead.createdById !== user.id) {
    throw new Error('Access denied to this lead.');
  }

  return lead;
};

export const createLead = async (data: any, user: any) => {
  const enrichedData = {
    ...data,
    createdById: user.id,
    // For partners, if not assigned explicitly, assign to self
    assignedToId: data.assignedToId || user.id,
    teamId: data.teamId || user.teamId || 'default-team',
  };
  const lead = await LeadRepo.create(enrichedData);
  await logAudit(user.id, 'LEAD_CREATE', 'LEAD', lead.id, `Lead ${lead.name} created by ${user.role}`);
  return lead;
};

export const bulkCreateLeads = async (data: any[], user: any) => {
  const enrichedData = data.map(lead => ({
    ...lead,
    createdById: user.id,
    teamId: lead.teamId || user.teamId || 'default-team',
    assignedToId: lead.assignedToId || user.id,
  }));
  const result = await LeadRepo.createMany(enrichedData);
  await logAudit(user.id, 'LEAD_BULK_CREATE', 'LEAD', undefined, `Bulk created ${data.length} leads by ${user.role}`);
  return result;
};

export const updateLead = async (id: string, data: any, user: any) => {
  const lead = await LeadRepo.findById(id);
  if (!lead) throw new Error('Lead not found');

  // Verify access
  if (user.role === 'BDE' && lead.assignedToId !== user.id) {
    throw new Error('Access denied to this lead.');
  }
  if (user.role === 'TEAM_LEAD' && lead.teamId !== user.teamId) {
    throw new Error('Access denied to this lead.');
  }
  if (user.role === 'CHANNEL_PARTNER' && lead.createdById !== user.id) {
    throw new Error('Access denied to this lead.');
  }
  
  const updateData = { ...data };
  if (data.nextFollowUp && lead.nextFollowUp?.getTime() !== new Date(data.nextFollowUp).getTime()) {
    updateData.meetingNotified = false;
  }
  
  const updatedLead = await LeadRepo.update(id, updateData);

  await logAudit(user.id, 'LEAD_UPDATE', 'LEAD', updatedLead.id, `Lead updated: ${Object.keys(data).join(', ')}`);

  // If nextFollowUp changed while the lead is in MEETING_SCHEDULED stage, it's a reschedule
  if (data.nextFollowUp && lead.nextFollowUp?.getTime() !== new Date(data.nextFollowUp).getTime()) {
    if (updatedLead.stage === 'MEETING_SCHEDULED' && updatedLead.nextFollowUp && lead.assignedTo?.email) {
      await sendMeetingScheduledEmail(
        lead.assignedTo.email,
        lead.assignedTo.name,
        updatedLead.name,
        updatedLead.nextFollowUp
      );
    }
  }

  return updatedLead;
};

export const deleteLead = async (id: string, user: any) => {
  const lead = await LeadRepo.findById(id);
  if (!lead) throw new Error('Lead not found');

  // Verify access
  if (user.role === 'BDE' && lead.assignedToId !== user.id) {
    throw new Error('Access denied to this lead.');
  }
  if (user.role === 'TEAM_LEAD' && lead.teamId !== user.teamId) {
    throw new Error('Access denied to this lead.');
  }
  if (user.role === 'CHANNEL_PARTNER' && lead.createdById !== user.id) {
    throw new Error('Access denied to this lead.');
  }

  await logAudit(user.id, 'LEAD_DELETE', 'LEAD', id, `Lead ${lead.name} deleted`);
  return LeadRepo.delete(id);
};

export const updateStage = async (
  id: string,
  stage: LeadStage,
  executorId: string,
  user: any,
  remarks?: string
) => {
  const lead = await LeadRepo.findById(id);
  if (!lead) throw new Error('Lead not found');

  // Verify access
  if (user.role === 'BDE' && lead.assignedToId !== user.id) {
    throw new Error('Access denied to this lead.');
  }
  if (user.role === 'TEAM_LEAD' && lead.teamId !== user.teamId) {
    throw new Error('Access denied to this lead.');
  }
  if (user.role === 'CHANNEL_PARTNER' && lead.createdById !== user.id) {
    throw new Error('Access denied to this lead.');
  }

  const [updatedLead, activity] = await LeadRepo.updateStage(id, stage, executorId, remarks);

  await logAudit(user.id, 'LEAD_STAGE_CHANGE', 'LEAD', updatedLead.id, `Stage changed to ${stage}${remarks ? `: ${remarks}` : ''}`);

  // If stage changed to MEETING_SCHEDULED, notify BDE
  if (stage === 'MEETING_SCHEDULED' && lead.stage !== 'MEETING_SCHEDULED') {
    if (updatedLead.nextFollowUp && lead.assignedTo?.email) {
      await sendMeetingScheduledEmail(
        lead.assignedTo.email,
        lead.assignedTo.name,
        updatedLead.name,
        updatedLead.nextFollowUp
      );
    }
  }

  return [updatedLead, activity];
};

export const getAllActivities = async (query: any, user: any) => {
  const { type, limit = 100 } = query;
  console.log('[Debug] getAllActivities called for user:', user?.id, user?.role, 'type filter:', type);

  const where: any = {};

  // Handle type filter
  if (type && type !== 'ALL') {
    const types = String(type).split(',').map((t: string) => t.trim()).filter(Boolean);
    if (types.length > 0) {
      where.type = { in: types };
    }
  }

  // Role-based scoping
  if (user?.role === 'BDE') {
    where.lead = { assignedToId: user.id };
  } else if (user?.role === 'TEAM_LEAD' && user.teamId) {
    where.lead = { teamId: user.teamId };
  } else if (user?.role === 'CHANNEL_PARTNER') {
    where.lead = { createdById: user.id };
  }

  const activities = await prisma.activity.findMany({
    where,
    take: Number(limit) || 100,
    orderBy: { createdAt: 'desc' },
    include: {
      lead: {
        select: { id: true, name: true, companyName: true },
      },
    },
  });

  return activities;
};

export const getActivities = async (leadId: string, user: any) => {
  const lead = await LeadRepo.findById(leadId);
  if (!lead) throw new Error('Lead not found');

  // Verify access
  if (user.role === 'BDE' && lead.assignedToId !== user.id) {
    throw new Error('Access denied to this lead.');
  }
  if (user.role === 'TEAM_LEAD' && lead.teamId !== user.teamId) {
    throw new Error('Access denied to this lead.');
  }
  if (user.role === 'CHANNEL_PARTNER' && lead.createdById !== user.id) {
    throw new Error('Access denied to this lead.');
  }

  return LeadRepo.getActivities(leadId);
};

export const addActivity = async (
  leadId: string,
  type: string,
  content: string,
  createdBy: string,
  user: any
) => {
  const lead = await LeadRepo.findById(leadId);
  if (!lead) throw new Error('Lead not found');

  // Verify access
  if (user.role === 'BDE' && lead.assignedToId !== user.id) {
    throw new Error('Access denied to this lead.');
  }
  if (user.role === 'TEAM_LEAD' && lead.teamId !== user.teamId) {
    throw new Error('Access denied to this lead.');
  }
  if (user.role === 'CHANNEL_PARTNER' && lead.createdById !== user.id) {
    throw new Error('Access denied to this lead.');
  }

  return LeadRepo.addActivity(leadId, type, content, createdBy);
};
