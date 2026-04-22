import { prisma } from '../../prisma';

export const getDashboardStats = async (userId: string, role: string, teamId: string | null, range?: string, startDate?: string, endDate?: string) => {
  const isAdmin = ['SUPER_ADMIN', 'SALES_HEAD'].includes(role);
  
  let whereClause: any = {};
  if (!isAdmin) {
    if (role === 'TEAM_LEAD') {
      whereClause.teamId = teamId;
    } else {
      whereClause.assignedToId = userId;
    }
  }

  // Add date filtering to whereClause
  if (range || (startDate && endDate)) {
    let start: Date | undefined;
    let end: Date | undefined;
    const now = new Date();

    if (range === 'TODAY') {
      start = new Date(now.setHours(0, 0, 0, 0));
      end = new Date(now.setHours(23, 59, 59, 999));
    } else if (range === 'YESTERDAY') {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      start = new Date(yesterday.setHours(0, 0, 0, 0));
      end = new Date(yesterday.setHours(23, 59, 59, 999));
    } else if (range === 'LAST_7_DAYS') {
      start = new Date(now);
      start.setDate(start.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      end = new Date(now);
      end.setHours(23, 59, 59, 999);
    } else if (range === 'CUSTOM' && startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
    }

    if (start && end) {
      whereClause.createdAt = {
        gte: start,
        lte: end
      };
    }
  }

  const [
    totalLeads,
    totalValue,
    revenue,
    overdueCount,
    leadsByStage,
    leadsByExecutive,
    recentActivities,
    conversionStats,
    todayMeetings,
    todayFollowUps,
  ] = await Promise.all([
    // Total leads count
    prisma.lead.count({ where: whereClause }),

    // Total Pipeline Value
    prisma.lead.aggregate({
      where: whereClause,
      _sum: { value: true }
    }).then(res => res._sum.value || 0),

    // Total Revenue (Payment Completed)
    prisma.lead.aggregate({
      where: { ...whereClause, stage: 'PAYMENT_COMPLETED' },
      _sum: { value: true }
    }).then(res => res._sum.value || 0),

    // Overdue Leads - Note: Overdue is usually based on follow-up, not createdAt
    prisma.lead.count({
      where: {
        ...whereClause,
        nextFollowUp: { lt: new Date() },
        stage: { notIn: ['PAYMENT_COMPLETED', 'HANDED_OVER', 'NOT_INTERESTED', 'DND', 'LOST'] }
      }
    }),

    // Leads grouped by stage
    prisma.lead.groupBy({
      by: ['stage'],
      _count: { _all: true },
      where: whereClause,
      orderBy: { _count: { stage: 'desc' } },
    }),

    // Leads per executive (admin only)
    isAdmin
      ? prisma.user.findMany({
          select: {
            id: true,
            name: true,
            role: true,
            _count: { 
              select: { 
                leads: {
                  where: whereClause
                }
              } 
            },
          },
          where: { isActive: true },
          orderBy: { createdAt: 'asc' },
        })
      : [],

    // Recent 10 activities (scoped)
    prisma.activity.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      where: {
        lead: whereClause,
      },
      include: {
        lead: {
          select: { id: true, name: true, companyName: true },
        },
      },
    }),

    // Conversion stats
    prisma.lead.groupBy({
      by: ['stage'],
      _count: { _all: true },
      where: {
        ...whereClause,
        stage: {
          in: [
            'MEETING_SCHEDULED',
            'MEETING_POSTPONED',
            'PROPOSAL_SHARED',
            'HANDED_OVER',
            'PAYMENT_COMPLETED',
          ],
        },
      },
    }),

    // Today's Meetings
    prisma.lead.count({
      where: {
        ...whereClause,
        stage: 'MEETING_SCHEDULED',
        nextFollowUp: {
          gte: new Date(new Date().setHours(0,0,0,0)),
          lt: new Date(new Date().setHours(23,59,59,999))
        }
      }
    }),

    // Today's Follow-ups (excluding meetings)
    prisma.lead.count({
      where: {
        ...whereClause,
        stage: { not: 'MEETING_SCHEDULED' },
        nextFollowUp: {
          gte: new Date(new Date().setHours(0,0,0,0)),
          lt: new Date(new Date().setHours(23,59,59,999))
        }
      }
    }),
  ]);

  return {
    totalLeads,
    totalValue,
    totalRevenue: revenue,
    overdueCount,
    leadsByStage: leadsByStage.map((s) => ({
      stage: s.stage,
      count: s._count._all,
    })),
    leadsByExecutive: leadsByExecutive.map((u: any) => ({
      id: u.id,
      name: u.name,
      role: u.role,
      leadsCount: u._count.leads,
    })),
    recentActivities,
    conversionStats: conversionStats.map((s) => ({
      stage: s.stage,
      count: s._count._all,
    })),
    todayMeetings,
    todayFollowUps,
  };
};

export const getPipelineStats = async () => {
  const stages = await prisma.lead.groupBy({
    by: ['stage'],
    _count: { _all: true },
    orderBy: { _count: { stage: 'desc' } },
  });

  const total = stages.reduce((sum, s) => sum + s._count._all, 0);

  return stages.map((s) => ({
    stage: s.stage,
    count: s._count._all,
    percentage: total > 0 ? Math.round((s._count._all / total) * 100) : 0,
  }));
};

export const getExecutiveStats = async () => {
  return prisma.user.findMany({
    where: { isActive: true, role: 'BDE' },
    select: {
      id: true,
      name: true,
      email: true,
      _count: {
        select: { leads: true, activities: true },
      },
    },
    orderBy: { createdAt: 'asc' },
  });
};
