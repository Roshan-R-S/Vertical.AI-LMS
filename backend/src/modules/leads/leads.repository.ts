import { LeadStage } from '@prisma/client';
import { prisma } from '../../prisma';

export const LeadRepo = {
  findAll: (filters: {
    stage?: LeadStage | 'OVERDUE';
    assignedToId?: string;
    createdById?: string;
    teamId?: string;
    search?: string;
    industry?: string;
    source?: string;
    skip?: number;
    take?: number;
  }) => {
    const { stage, assignedToId, createdById, teamId, search, industry, source, skip = 0, take = 20 } = filters;
    
    const isOverdueFilter = stage === 'OVERDUE';
    const actualStage = isOverdueFilter ? undefined : stage;

    return prisma.lead.findMany({
      where: {
        ...(actualStage && { stage: actualStage as LeadStage }),
        ...(assignedToId && { assignedToId }),
        ...(createdById && { createdById }),
        ...(teamId && { teamId }),
        ...(industry && { industry }),
        ...(source && { source }),
        ...(isOverdueFilter && {
          nextFollowUp: { lt: new Date() },
          NOT: {
            stage: { in: ['PAYMENT_COMPLETED', 'HANDED_OVER', 'NOT_INTERESTED', 'DND', 'LOST'] as LeadStage[] }
          }
        }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { companyName: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      include: {
        assignedTo: { select: { id: true, name: true, email: true, role: true } },
        creator: { select: { id: true, name: true, role: true } },
      },
      orderBy: { updatedAt: 'desc' },
      skip,
      take,
    });
  },

  count: (filters: {
    stage?: LeadStage | 'OVERDUE';
    assignedToId?: string;
    createdById?: string;
    teamId?: string;
    search?: string;
    industry?: string;
    source?: string;
  }) => {
    const { stage, assignedToId, createdById, teamId, search, industry, source } = filters;
    
    const isOverdueFilter = stage === 'OVERDUE';
    const actualStage = isOverdueFilter ? undefined : stage;

    return prisma.lead.count({
      where: {
        ...(actualStage && { stage: actualStage as LeadStage }),
        ...(assignedToId && { assignedToId }),
        ...(createdById && { createdById }),
        ...(teamId && { teamId }),
        ...(industry && { industry }),
        ...(source && { source }),
        ...(isOverdueFilter && {
          nextFollowUp: { lt: new Date() },
          NOT: {
            stage: { in: ['PAYMENT_COMPLETED', 'HANDED_OVER', 'NOT_INTERESTED', 'DND', 'LOST'] as LeadStage[] }
          }
        }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { companyName: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
    });
  },

  getStats: async (filters: {
    assignedToId?: string;
    createdById?: string;
    teamId?: string;
    search?: string;
    industry?: string;
    source?: string;
  }) => {
    const { assignedToId, createdById, teamId, search, industry, source } = filters;

    // 1. Shared scope constraints (role-based)
    const scope: any = {
      ...(assignedToId && { assignedToId }),
      ...(createdById && { createdById }),
      ...(teamId && { teamId }),
    };

    // 2. Shared attribute constraints
    const attrs: any = {
      ...(industry && { industry }),
      ...(source && { source }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { companyName: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    // 3. Construct total scope (ignoring stage)
    const totalWhere = { ...scope, ...attrs };

    const [aggregate, meetingsCount, overdueCount, uniques] = await Promise.all([
      prisma.lead.aggregate({
        where: totalWhere,
        _sum: { value: true },
        _count: { id: true }
      }),
      prisma.lead.count({
        where: { ...totalWhere, stage: 'MEETING_SCHEDULED' }
      }),
      prisma.lead.count({
        where: {
          ...totalWhere,
          nextFollowUp: { lt: new Date() },
          NOT: {
            stage: { in: ['PAYMENT_COMPLETED', 'HANDED_OVER', 'NOT_INTERESTED', 'DND', 'LOST'] as LeadStage[] }
          }
        }
      }),
      prisma.lead.findMany({
        where: totalWhere,
        select: { industry: true, source: true },
        distinct: ['industry', 'source']
      })
    ]);

    const industries = Array.from(new Set(uniques.map(u => u.industry).filter(Boolean))) as string[];
    const sources = Array.from(new Set(uniques.map(u => u.source).filter(Boolean))) as string[];

    return {
      totalLeads: aggregate._count.id,
      totalValue: aggregate._sum.value || 0,
      meetingsCount,
      overdueCount,
      industries,
      sources
    };
  },

  findById: (id: string) =>
    prisma.lead.findUnique({
      where: { id },
      include: {
        assignedTo: { select: { id: true, name: true, email: true, role: true } },
        creator: { select: { id: true, name: true, role: true } },
        activities: { orderBy: { createdAt: 'desc' } },
      },
    }),

  create: async (data: any) => {
    return prisma.$transaction(async (tx) => {
      const lead = await tx.lead.create({ data });
      await tx.activity.create({
        data: {
          leadId: lead.id,
          type: 'LEAD_CREATED',
          content: 'Lead created in system',
          createdBy: data.createdById || data.assignedToId,
        },
      });
      return lead;
    });
  },

  createMany: async (leads: any[]) => {
    return prisma.$transaction(async (tx) => {
      const results = [];
      for (const leadData of leads) {
        const lead = await tx.lead.create({ data: leadData });
        await tx.activity.create({
          data: {
            leadId: lead.id,
            type: 'LEAD_CREATED',
            content: 'Lead created via bulk upload',
            createdBy: leadData.createdById || leadData.assignedToId,
          },
        });
        results.push(lead);
      }
      return results;
    });
  },

  update: (id: string, data: any) => {
    return prisma.lead.update({
      where: { id },
      data,
    });
  },

  delete: (id: string) => prisma.lead.delete({ where: { id } }),

  updateStage: async (
    id: string,
    stage: LeadStage,
    executorId: string,
    remarks?: string
  ) => {
    return prisma.$transaction([
      prisma.lead.update({
        where: { id },
        data: { 
          stage, 
          lastFollowUp: new Date(),
          ...(stage === 'MEETING_SCHEDULED' ? { meetingNotified: false } : {}),
        },
      }),
      prisma.activity.create({
        data: {
          leadId: id,
          type: 'STAGE_CHANGE',
          content: `Stage changed to ${stage}${remarks ? ': ' + remarks : ''}`,
          createdBy: executorId,
        },
      }),
    ]);
  },

  getActivities: (leadId: string) =>
    prisma.activity.findMany({
      where: { leadId },
      orderBy: { createdAt: 'desc' },
    }),

  addActivity: (leadId: string, type: string, content: string, createdBy: string) =>
    prisma.activity.create({
      data: { leadId, type, content, createdBy },
    }),
};
