import { Request, Response } from 'express';
import { prisma } from '../../prisma';
import { getLeadScopeFilter, getTaskScopeFilter } from '../../utils/scoping';
import { Role } from '@prisma/client';
import { asyncHandler } from '../../utils/async-handler';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_MS = 24 * 60 * 60 * 1000;

const CYCLE_VELOCITY_STAGES = [
  {
    stage: 'New -> First Contact',
    milestoneMatchers: [/^new$/i],
  },
  {
    stage: 'Contact -> Qualify',
    milestoneMatchers: [/contact/i, /first\s*(call|contact)/i],
  },
  {
    stage: 'Qualify -> Demo',
    milestoneMatchers: [/qual/i, /demo\s*scheduled/i],
  },
  {
    stage: 'Demo -> Proposal',
    milestoneMatchers: [/demo\s*completed/i],
  },
  {
    stage: 'Proposal -> Close',
    milestoneMatchers: [/proposal/i, /negotiation/i],
  },
];

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function getDateRangeForPeriod(period: string, from?: string, to?: string) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  if (period === 'all-time') return undefined;

  if (period === 'custom' && from && to) {
    return {
      gte: startOfDay(new Date(from)),
      lte: endOfDay(new Date(to)),
    };
  }

  if (period === 'today') {
    return { gte: startOfDay(now), lte: endOfDay(now) };
  }

  if (period === 'this-week') {
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
    const start = new Date(now.setDate(diff));
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { gte: start, lte: end };
  }

  if (period === 'this-month' || period === 'month-0') {
    return {
      gte: new Date(year, month, 1),
      lte: new Date(year, month + 1, 0, 23, 59, 59),
    };
  }

  if (period === 'last-month' || period === 'month-1') {
    return {
      gte: new Date(year, month - 1, 1),
      lte: new Date(year, month, 0, 23, 59, 59),
    };
  }

  if (period === 'current-quarter') {
    const qStartMonth = Math.floor(month / 3) * 3;
    return {
      gte: new Date(year, qStartMonth, 1),
      lte: new Date(year, qStartMonth + 3, 0, 23, 59, 59),
    };
  }

  if (period === 'current-year') {
    return {
      gte: new Date(year, 0, 1),
      lte: new Date(year, 11, 31, 23, 59, 59),
    };
  }

  if (period?.startsWith('month-')) {
    const offset = parseInt(period.split('-')[1]);
    const d = new Date(year, month - offset, 1);
    return {
      gte: d,
      lte: new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59),
    };
  }

  // Default to this month
  return {
    gte: new Date(year, month, 1),
    lte: new Date(year, month + 1, 0, 23, 59, 59),
  };
}

function getPreviousDateRange(dateFilter?: { gte: Date; lte: Date }) {
  if (!dateFilter) return undefined;
  const duration = dateFilter.lte.getTime() - dateFilter.gte.getTime();
  const previousEnd = new Date(dateFilter.gte.getTime() - 1);
  const previousStart = new Date(previousEnd.getTime() - duration);
  return { gte: previousStart, lte: previousEnd };
}

function pctChange(current: number, previous: number) {
  if (!previous) return current > 0 ? 100 : 0;
  return Number((((current - previous) / previous) * 100).toFixed(1));
}

function round(value: number, digits = 1) {
  return Number(value.toFixed(digits));
}

function dateWhere(dateFilter?: { gte: Date; lte: Date }) {
  return dateFilter ? { createdAt: dateFilter } : {};
}

function updateDateWhere(dateFilter?: { gte: Date; lte: Date }) {
  return dateFilter ? { updatedAt: dateFilter } : {};
}

function scopedLeadFilter(user: any, bdeId?: string, teamId?: string, source?: string) {
  const base: any = getLeadScopeFilter(user);

  if (bdeId && bdeId !== 'All') {
    if (user.role === Role.BDE) {
      base.assignedToId = user.id;
    } else {
      base.assignedToId = bdeId;
    }
  }

  if (teamId && teamId !== 'All' && user.role === Role.SUPER_ADMIN) {
    base.assignedTo = { ...(base.assignedTo ?? {}), teamId };
  }

  if (source && source !== 'All') {
    base.source = source;
  }

  return base;
}

function scopedTaskFilter(user: any, bdeId?: string, teamId?: string) {
  const base: any = getTaskScopeFilter(user);

  if (bdeId && bdeId !== 'All') {
    if (user.role === Role.BDE) {
      base.assignedToId = user.id;
    } else {
      base.assignedToId = bdeId;
    }
  }

  if (teamId && teamId !== 'All' && user.role === Role.SUPER_ADMIN) {
    base.assignedTo = { ...(base.assignedTo ?? {}), teamId };
  }

  return base;
}

function getQualifiedMilestoneNames(milestones: any[]) {
  const qualifiedIndex = milestones.findIndex((m) => /qual/i.test(m.name));
  if (qualifiedIndex >= 0) return milestones.slice(qualifiedIndex).map((m) => m.name);
  return milestones.slice(1).map((m) => m.name);
}

function findMilestoneValue(funnelData: any[], matcher: RegExp) {
  return funnelData.find((m) => matcher.test(m.name))?.value ?? 0;
}

function findMilestoneIds(milestones: any[], matchers: RegExp[]) {
  return milestones
    .filter((m) => matchers.some((matcher) => matcher.test(m.name)))
    .map((m) => m.id);
}

// GET /api/v1/analytics/dashboard
export const getDashboard = asyncHandler(async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const period = (req.query.period as string) || 'this-month';
    const bdeId = req.query.bdeId as string | undefined;
    const teamId = req.query.teamId as string | undefined;
    const source = req.query.source as string | undefined;
    const from = req.query.from as string | undefined;
    const to = req.query.to as string | undefined;
    const dateFilter = getDateRangeForPeriod(period, from, to);
    const previousDateFilter = getPreviousDateRange(dateFilter);

    const leadScope = scopedLeadFilter(user, bdeId, teamId, source);
    const taskScope = scopedTaskFilter(user, bdeId, teamId);
    const leadCreatedWhere = { ...leadScope, ...dateWhere(dateFilter) };
    const previousLeadCreatedWhere = { ...leadScope, ...dateWhere(previousDateFilter) };
    const leadUpdatedWhere = { ...leadScope, ...updateDateWhere(dateFilter) };
    const previousLeadUpdatedWhere = { ...leadScope, ...updateDateWhere(previousDateFilter) };
    const trendStart = new Date(new Date().getFullYear(), new Date().getMonth() - 5, 1);
    const interactionWhere = {
      deletedAt: null,
      ...dateWhere(dateFilter),
      lead: leadScope,
    };
    const previousInteractionWhere = {
      deletedAt: null,
      ...dateWhere(previousDateFilter),
      lead: leadScope,
    };

    const [
      milestones,
      totalLeads,
      activeLeads,
      wonDeals,
      lostDeals,
      pipelineAgg,
      closedAgg,
      previousClosedAgg,
      previousPipelineAgg,
      pendingTasks,
      overdueFollowUps,
      sourceGroups,
      sourceWonGroups,
      sourceRevenueGroups,
      activeLeadsForWeighted,
      staleCandidates,
      totalCalls,
      previousTotalCalls,
      meetingsBooked,
      qualifiedCountRaw,
      highPriorityLeads,
      previousWonDeals,
      wonLeadDurations,
      trendLeads,
    ] = await Promise.all([
      prisma.milestone.findMany({ orderBy: { order: 'asc' } }),
      prisma.lead.count({ where: leadCreatedWhere }),
      prisma.lead.count({ where: { ...leadCreatedWhere, status: 'active' } }),
      prisma.lead.count({ where: { ...leadUpdatedWhere, status: 'won' } }),
      prisma.lead.count({ where: { ...leadUpdatedWhere, status: 'lost' } }),
      prisma.lead.aggregate({ _sum: { value: true }, where: { ...leadCreatedWhere, status: 'active' } }),
      prisma.lead.aggregate({ _sum: { value: true }, where: { ...leadUpdatedWhere, status: 'won' } }),
      prisma.lead.aggregate({ _sum: { value: true }, where: { ...previousLeadUpdatedWhere, status: 'won' } }),
      prisma.lead.aggregate({ _sum: { value: true }, where: { ...previousLeadCreatedWhere, status: 'active' } }),
      prisma.task.count({ where: { ...taskScope, ...dateWhere(dateFilter), status: 'pending' } }),
      prisma.task.count({ where: { ...taskScope, status: 'overdue' } }),
      prisma.lead.groupBy({
        by: ['source'],
        _count: { id: true },
        where: { ...leadCreatedWhere, source: { not: null } },
      }),
      prisma.lead.groupBy({
        by: ['source'],
        _count: { id: true },
        where: { ...leadUpdatedWhere, status: 'won', source: { not: null } },
      }),
      prisma.lead.groupBy({
        by: ['source'],
        _sum: { value: true },
        where: { ...leadUpdatedWhere, status: 'won', source: { not: null } },
      }),
      prisma.lead.findMany({
        where: { ...leadCreatedWhere, status: 'active' },
        select: { value: true, probability: true },
      }),
      prisma.lead.findMany({
        where: { ...leadScope, status: 'active' },
        select: {
          id: true,
          value: true,
          updatedAt: true,
          lastFollowUp: true,
          createdAt: true,
          interactions: {
            where: { deletedAt: null },
            select: { createdAt: true },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      }),
      prisma.interaction.count({ where: { ...interactionWhere, type: 'call' } }),
      prisma.interaction.count({ where: { ...previousInteractionWhere, type: 'call' } }),
      prisma.interaction.count({ where: { ...interactionWhere, type: 'meeting' } }),
      prisma.lead.count({ where: leadCreatedWhere }),
      prisma.lead.count({ where: { ...leadCreatedWhere, priority: 'High' } }),
      prisma.lead.count({ where: { ...previousLeadUpdatedWhere, status: 'won' } }),
      prisma.lead.findMany({
        where: { ...leadUpdatedWhere, status: 'won' },
        select: { createdAt: true, updatedAt: true },
      }),
      prisma.lead.findMany({
        where: {
          ...leadScope,
          OR: [
            { createdAt: { gte: trendStart, lte: endOfDay(new Date()) } },
            { updatedAt: { gte: trendStart, lte: endOfDay(new Date()) } },
          ],
        },
        select: { createdAt: true, updatedAt: true, value: true, probability: true, status: true },
      }),
    ]);

    const qualifiedMilestoneNames = getQualifiedMilestoneNames(milestones);
    const qualifiedCount = qualifiedMilestoneNames.length
      ? await prisma.lead.count({
          where: {
            ...leadCreatedWhere,
            milestone: { name: { in: qualifiedMilestoneNames } },
          },
        })
      : qualifiedCountRaw;

    const funnelCounts = await Promise.all(
      milestones.map(async (m) => ({
        name: m.name,
        value: await prisma.lead.count({ where: { ...leadCreatedWhere, milestoneId: m.id } }),
        fill: m.color,
      })),
    );

    const sourceWonMap = new Map(sourceWonGroups.map((s: any) => [s.source ?? 'Unknown', s._count.id]));
    const sourceRevenueMap = new Map(sourceRevenueGroups.map((s: any) => [s.source ?? 'Unknown', s._sum.value ?? 0]));
    const sourceData = sourceGroups
      .map((s: any) => {
        const name = s.source ?? 'Unknown';
        const value = s._count.id;
        const sourceWonDeals = Number(sourceWonMap.get(name) ?? 0);
        const revenue = Number(sourceRevenueMap.get(name) ?? 0);
        return {
          name,
          value,
          wonDeals: sourceWonDeals,
          conversionPct: value ? round((sourceWonDeals / value) * 100) : 0,
          revenue,
        };
      })
      .sort((a, b) => b.value - a.value);

    const weightedExpected = activeLeadsForWeighted.reduce((sum, l) => {
      return sum + ((l.value || 0) * (l.probability || 0) / 100);
    }, 0);

    const staleCutoff = Date.now() - 48 * 60 * 60 * 1000;
    const staleLeads = staleCandidates.filter((lead: any) => {
      const latestActivity = lead.interactions[0]?.createdAt ?? lead.lastFollowUp ?? lead.updatedAt ?? lead.createdAt;
      return new Date(latestActivity).getTime() < staleCutoff;
    });

    const closedRevenue = closedAgg._sum.value || 0;
    const totalPipelineValue = pipelineAgg._sum.value || 0;
    const previousClosedRevenue = previousClosedAgg._sum.value || 0;
    const previousPipelineValue = previousPipelineAgg._sum.value || 0;
    const avgDealSize = wonDeals > 0 ? closedRevenue / wonDeals : 0;
    const previousAvgDealSize = previousWonDeals > 0 ? previousClosedRevenue / previousWonDeals : 0;

    const demoCount = findMilestoneValue(funnelCounts, /demo/i);
    const proposalCount = findMilestoneValue(funnelCounts, /proposal/i);
    const leadToQualifiedPct = totalLeads ? round((qualifiedCount / totalLeads) * 100) : 0;
    const demoToProposalPct = demoCount ? round((proposalCount / demoCount) * 100) : 0;
    const winRatePct = totalLeads ? round((wonDeals / totalLeads) * 100) : 0;
    const priorityCoveragePct = totalLeads ? round((highPriorityLeads / totalLeads) * 100, 0) : 0;
    const momentumPct = pctChange(wonDeals, previousWonDeals);

    const monthlyTrend = Array.from({ length: 6 }, (_, i) => {
      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth() - (5 - i), 1);
      const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0, 23, 59, 59, 999);
      const monthLeads = trendLeads.filter((l: any) => {
        const createdAt = new Date(l.createdAt);
        return createdAt >= monthStart && createdAt <= monthEnd;
      });
      const wonInMonth = trendLeads.filter((l: any) => {
        const updatedAt = new Date(l.updatedAt);
        return l.status === 'won' && updatedAt >= monthStart && updatedAt <= monthEnd;
      });
      const revenue = wonInMonth
        .reduce((sum: number, l: any) => sum + (l.value || 0), 0) / 100000;
      const pipeline = monthLeads
        .filter((l: any) => l.status === 'active')
        .reduce((sum: number, l: any) => sum + ((l.value || 0) * (l.probability || 0) / 100), 0) / 100000;
      return {
        name: MONTH_LABELS[monthStart.getMonth()],
        revenue: round(revenue),
        pipeline: round(pipeline),
        leads: monthLeads.length,
      };
    });

    const cycleVelocityData = await Promise.all(
      CYCLE_VELOCITY_STAGES.map(async (cycleStage) => {
        const milestoneIds = findMilestoneIds(milestones, cycleStage.milestoneMatchers);
        const leadsInStage = milestoneIds.length
          ? await prisma.lead.findMany({
              where: {
                ...leadScope,
                ...(dateFilter ? dateWhere(dateFilter) : {}),
                status: 'active',
                milestoneId: { in: milestoneIds },
              },
              select: { updatedAt: true, createdAt: true },
            })
          : [];
        const totalDays = leadsInStage.reduce((sum, l) => {
          return sum + ((Date.now() - new Date(l.updatedAt ?? l.createdAt).getTime()) / DAY_MS);
        }, 0);
        return {
          stage: cycleStage.stage,
          days: leadsInStage.length ? round(totalDays / leadsInStage.length) : 0,
        };
      }),
    );

    const avgTimeToCloseDays = wonLeadDurations.length
      ? round(wonLeadDurations.reduce((sum, l) => {
          return sum + ((new Date(l.updatedAt).getTime() - new Date(l.createdAt).getTime()) / (24 * 60 * 60 * 1000));
        }, 0) / wonLeadDurations.length)
      : 0;

    const topSource = sourceData[0] ?? null;
    const sourceInsight = {
      topSource: topSource?.name ?? null,
      text: topSource
        ? `${topSource.name} is the top source with ${topSource.value} leads, ${topSource.conversionPct}% conversion, and ₹${Math.round(topSource.revenue).toLocaleString('en-IN')} revenue.`
        : 'No source data is available for the selected filters.',
    };

    // Populate bdePerformance for TL and Admin roles
    let bdePerformance: any[] = [];
    if (user.role === Role.TEAM_LEAD || user.role === Role.SUPER_ADMIN) {
      const bdeWhere: any = { role: Role.BDE, isActive: true };
      if (user.role === Role.TEAM_LEAD && user.teamId) bdeWhere.teamId = user.teamId;
      if (bdeId && bdeId !== 'All') bdeWhere.id = bdeId;

      const bdeUsers = await prisma.user.findMany({
        where: bdeWhere,
        include: {
          team: true,
          assignedLeads: {
            where: { status: 'won', ...updateDateWhere(dateFilter) },
            select: { value: true },
          },
          interactions: {
            where: { deletedAt: null, ...dateWhere(dateFilter) },
            select: { createdAt: true },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
          _count: {
            select: {
              interactions: { where: { deletedAt: null, ...dateWhere(dateFilter) } },
              assignedLeads: { where: { status: 'won', ...updateDateWhere(dateFilter) } },
            },
          },
        },
      });

      bdePerformance = bdeUsers.map(b => ({
        id: b.id,
        name: b.name,
        avatar: b.avatar,
        team: b.team?.name ?? null,
        calls: b._count.interactions,
        meetings: Math.round(b._count.interactions * 0.2),
        deals: b._count.assignedLeads,
        revenue: b.assignedLeads.reduce((s, l) => s + l.value, 0),
        isActive: b.isActive,
        lastActivity: b.interactions[0]?.createdAt
          ? new Date(b.interactions[0].createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
          : null,
      }));
    }

    return res.json({
      kpis: {
        totalRevenue: closedRevenue,
        closedRevenue,
        totalPipelineValue,
        pipelineRevenue: totalPipelineValue,
        weightedExpected,
        totalLeads,
        activeLeads,
        wonDeals,
        lostDeals,
        staleLeads: staleLeads.length,
        activePipeline: activeLeads,
        pendingTasks,
        overdueFollowUps,
        avgDealSize,
        highValueProspects: staleCandidates.filter((l: any) => (l.value || 0) >= 100000).length,
      },
      trends: {
        totalRevenuePct: pctChange(closedRevenue, previousClosedRevenue),
        closedRevenuePct: pctChange(closedRevenue, previousClosedRevenue),
        pipelinePct: pctChange(totalPipelineValue, previousPipelineValue),
        weightedExpectedPct: pctChange(weightedExpected, previousPipelineValue),
        callsPct: pctChange(totalCalls, previousTotalCalls),
        avgDealSizePct: pctChange(avgDealSize, previousAvgDealSize),
        momentumPct,
      },
      conversionActivity: {
        leadToQualifiedPct,
        demoToProposalPct,
        totalCalls,
        meetingsBooked,
        avgDealSize,
      },
      teamExecution: {
        winRatePct,
        priorityCoveragePct,
        staleLeadCount: staleLeads.length,
        momentumScorePct: momentumPct,
      },
      funnelData: funnelCounts,
      sourceData,
      sourceInsight,
      monthlyTrend,
      bdePerformance,
      cycleData: cycleVelocityData,
      cycleSummary: {
        avgTimeToCloseDays,
      },
    });
  } catch (error: any) {
    const fs = require('fs');
    const logMsg = `[DASHBOARD ERROR] ${new Date().toISOString()} - ${error.message}\n${error.stack}\n\n`;
    fs.appendFileSync('debug.log', logMsg);
    throw error;
  }
});


// GET /api/v1/analytics/leaderboard?period=month-0
export const getLeaderboard = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const period = (req.query.period as string) || 'month-0';
  const dateFilter = getDateRangeForPeriod(period);

  const bdeUsers = await prisma.user.findMany({
    where: { 
      role: 'BDE', 
      isActive: true,
      ...(user.role === Role.TEAM_LEAD && { teamId: user.teamId }),
      ...(user.role === Role.BDE && { teamId: user.teamId }), // show teammates to BDE
    },
    include: {
      team: true,
      assignedLeads: {
        where: { 
          status: 'won',
          updatedAt: dateFilter, // Using updatedAt as "wonAt" proxy
        },
        select: { value: true },
      },
      _count: { 
        select: { 
          interactions: {
            where: { createdAt: dateFilter }
          } 
        } 
      },
    },
    orderBy: { name: 'asc' },
  });

  const ranked = bdeUsers.map(u => ({
    id: u.id,
    name: u.name,
    avatar: u.avatar,

    team: u.team?.name ?? null,
    revenue: u.assignedLeads.reduce((s, l) => s + l.value, 0),
    deals: u.assignedLeads.length,
    calls: u._count.interactions,
    target: 500000,
  })).sort((a, b) => b.revenue - a.revenue);

  const tlUsers = await prisma.user.findMany({
    where: { 
      role: 'TEAM_LEAD', 
      isActive: true,
      ...(user.role !== Role.SUPER_ADMIN && { teamId: user.teamId }),
    },
    include: { team: true },
  });

  // compute team revenues
  const teamRevenues = await Promise.all(
    tlUsers.map(async tl => {
      if (!tl.teamId) return { tl, revenue: 0 };
      const teamBDEs = await prisma.user.findMany({ where: { teamId: tl.teamId, role: 'BDE' } });
      const bdeIds = teamBDEs.map(b => b.id);
      const agg = await prisma.lead.aggregate({ 
        _sum: { value: true }, 
        where: { 
          assignedToId: { in: bdeIds }, 
          status: 'won',
          updatedAt: dateFilter 
        } 
      });
      return { tl, revenue: agg._sum.value ?? 0 };
    })
  );
  const topTeam = teamRevenues.sort((a, b) => b.revenue - a.revenue)[0];

  return res.json({
    bde: ranked,
    topTeam: topTeam ? {
      teamName: topTeam.tl.team?.name,
      tlName: topTeam.tl.name,
      revenue: topTeam.revenue,
    } : null,
    topIndividual: ranked[0] ?? null,
    quarterlyPerformer: ranked[1] ?? null,
    annualPerformer: ranked[2] ?? null,
  });
});

// GET /api/v1/analytics/team-performance
export const getTeamPerformance = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const tls = await prisma.user.findMany({
    where: { 
      role: 'TEAM_LEAD', 
      isActive: true,
      ...(user.role !== Role.SUPER_ADMIN && { id: user.id }), // TL only sees self, Super Admin sees all
    },
    include: { team: true },
  });

  const result = await Promise.all(tls.map(async tl => {
    const teamBDEs = await prisma.user.findMany({
      where: { teamId: tl.teamId ?? '', role: 'BDE' },
      include: {
        assignedLeads: { where: { status: 'won' }, select: { value: true } },
        _count: { select: { interactions: true, assignedLeads: true } },
      },
    });

    const bdeStats = teamBDEs.map(b => ({
      id: b.id,
      name: b.name,
      avatar: b.avatar,

      calls: b._count.interactions,
      meetings: Math.round(b._count.interactions * 0.2),
      deals: b.assignedLeads.length,
      revenue: b.assignedLeads.reduce((s, l) => s + l.value, 0),
      target: 500000,
      executionScore: Math.min(100, Math.round((b._count.interactions / 40) * 100)), // 40 calls target
      workQueue: {
        done: b._count.interactions,
        total: 50
      },
      alerts: {
        staleLeads: 0, // Placeholder or compute
        overdueTasks: 0 // Placeholder or compute
      }
    }));

    const teamRevenue = bdeStats.reduce((s, b) => s + b.revenue, 0);
    const teamTarget = bdeStats.reduce((s, b) => s + b.target, 0);

    return {
      tl: {
        id: tl.id,
        name: tl.name,
        avatar: tl.avatar,
        team: tl.team?.name,

      },
      teamRevenue,
      teamTarget,
      pct: teamTarget ? Math.round((teamRevenue / teamTarget) * 100) : 0,
      bdes: bdeStats,
    };
  }));

  return res.json(result);
});
