import { Request, Response } from 'express';
import { prisma } from '../../prisma';
import { getLeadScopeFilter, getTaskScopeFilter } from '../../utils/scoping';
import { Role } from '@prisma/client';
import { asyncHandler } from '../../utils/async-handler';

function getDateRangeForPeriod(period: string) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  if (period === 'today') {
    const start = new Date(now.setHours(0, 0, 0, 0));
    const end = new Date(now.setHours(23, 59, 59, 999));
    return { gte: start, lte: end };
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

// GET /api/v1/analytics/dashboard
export const getDashboard = asyncHandler(async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
  const period = (req.query.period as string) || 'this-month';
  const bdeId = req.query.bdeId as string | undefined;
  const dateFilter = getDateRangeForPeriod(period);

  // We only apply dateFilter to leads and tasks related counts
  let leadScope: any = getLeadScopeFilter(user);
  let taskScope: any = getTaskScopeFilter(user);

  if (bdeId && bdeId !== 'All') {
    // If a specific BDE is selected, we filter by their ID.
    // This should work for Team Leads, Admins, and Super Admins.
    leadScope = { deletedAt: null, assignedToId: bdeId };
    taskScope = { deletedAt: null, assignedToId: bdeId };
  }

  const [
    totalLeads, activeLeads, wonDeals, lostDeals,
    pipelineAgg, closedAgg,
    milestones, staleLeads, overdueFollowUps,
    sourceGroups, allLeads, bdeUsers,
  ] = await Promise.all([
    prisma.lead.count({ where: { ...leadScope, createdAt: dateFilter } }),
    prisma.lead.count({ where: { ...leadScope, status: 'active', createdAt: dateFilter } }),
    prisma.lead.count({ where: { ...leadScope, status: 'won', updatedAt: dateFilter } }),
    prisma.lead.count({ where: { ...leadScope, status: 'lost', updatedAt: dateFilter } }),
    prisma.lead.aggregate({ _sum: { value: true }, where: { ...leadScope, status: 'active', createdAt: dateFilter } }),
    prisma.lead.aggregate({ _sum: { value: true }, where: { ...leadScope, status: 'won', updatedAt: dateFilter } }),
    prisma.milestone.findMany({ 
      include: { 
        _count: { 
          select: { leads: { where: { ...leadScope, createdAt: dateFilter } } } 
        } 
      }, 
      orderBy: { order: 'asc' } 
    }),
    prisma.lead.count({
      where: {
        ...leadScope,
        status: 'active',
        updatedAt: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    }),
    prisma.task.count({ where: { ...taskScope, status: 'overdue' } }),
    prisma.lead.groupBy({ 
      by: ['source'], 
      _count: { id: true }, 
      where: { ...leadScope, source: { not: null }, createdAt: dateFilter } 
    }),
    prisma.lead.findMany({
      where: { ...leadScope, createdAt: dateFilter },
      select: { createdAt: true, value: true, probability: true, status: true },
    }),
    prisma.user.findMany({
      where: { 
        role: 'BDE', 
        isActive: true,
        ...(user.role === Role.TEAM_LEAD && { teamId: user.teamId }),
        ...(user.role === Role.BDE && { id: user.id }),
        ...(bdeId && bdeId !== 'All' && user.role === Role.TEAM_LEAD && { id: bdeId }),
      },
      include: {
        team: true,
        assignedLeads: {
          select: { value: true, status: true },
          where: { status: 'won', updatedAt: dateFilter },
        },
        _count: { 
          select: { 
            interactions: { where: { createdAt: dateFilter } }, 
            assignedLeads: { where: { createdAt: dateFilter } } 
          } 
        },
      },
    }),
  ]);

  // Funnel data from milestones
  const funnelData = milestones.map((m: any) => ({
    name: m.name,
    value: m._count.leads,
    fill: m.color,
  }));

  // Source data
  const sourceData = sourceGroups.map((s: any) => ({
    name: s.source ?? 'Unknown',
    value: s._count.id,
  }));

  // Monthly trend (last 6 months)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  const monthlyTrend = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const monthLeads = allLeads.filter((l: any) => {
      const ld = new Date(l.createdAt);
      return ld.getMonth() === d.getMonth() && ld.getFullYear() === d.getFullYear();
    });
    const revenue = monthLeads.filter((l: any) => l.status === 'won').reduce((s: any, l: any) => s + l.value, 0) / 100000;
    const pipeline = monthLeads.filter((l: any) => l.status === 'active').reduce((s: any, l: any) => s + (l.value * l.probability / 100), 0) / 100000;
    return { name: months[d.getMonth()], revenue: parseFloat(revenue.toFixed(1)), pipeline: parseFloat(pipeline.toFixed(1)), leads: monthLeads.length };
  });

  // BDE performance
  const bdePerformance = bdeUsers.map((u: any) => ({
    name: u.name,
    team: u.team?.name?.replace('Team ', '') ?? '',
    calls: u._count.interactions,
    meetings: Math.round(u._count.interactions * 0.2),
    deals: u.assignedLeads.length,
    revenue: u.assignedLeads.reduce((s: any, l: any) => s + l.value, 0),
    target: 500000,
  })).sort((a: any, b: any) => b.revenue - a.revenue);

    const pipelineRevenue = pipelineAgg._sum.value || 0;
    const weightedExpected = allLeads.reduce((sum, l) => {
      if (l.status === 'active') {
        return sum + ((l.value || 0) * (l.probability || 0) / 100);
      }
      return sum;
    }, 0);

    return res.json({
      kpis: {
        totalLeads,
        activeLeads,
        wonDeals,
        lostDeals,
        pipelineRevenue,
        totalPipelineValue: pipelineRevenue,
        weightedExpected,
        closedRevenue: closedAgg._sum.value || 0,
        staleLeads,
        overdueFollowUps,
        avgDealSize: wonDeals > 0 ? (closedAgg._sum.value ?? 0) / wonDeals : 0,
        highValueProspects: allLeads.filter((l: any) => l.status === 'active' && l.value >= 100000).length,
      },
      funnelData,
      sourceData,
      monthlyTrend,
      bdePerformance,
      cycleData: [
        { stage: 'Lead -> Close', days: 15.4 }, // simplified for now
        { stage: 'Qualify -> Won', days: 8.2 },
      ],
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
