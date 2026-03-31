import { prisma } from '../../prisma';

export const getDashboardStats = async (userId: string, role: string) => {
  const isAdmin = ['SUPER_ADMIN', 'SALES_ADMIN'].includes(role);
  const whereClause = isAdmin ? {} : { assignedToId: userId };

  const [
    totalLeads,
    leadsByStage,
    leadsByExecutive,
    recentActivities,
    conversionStats,
  ] = await Promise.all([
    // Total leads count
    prisma.lead.count({ where: whereClause }),

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
            _count: { select: { leads: true } },
          },
          where: { isActive: true },
          orderBy: { createdAt: 'asc' },
        })
      : [],

    // Recent 10 activities
    prisma.activity.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
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
  ]);

  return {
    totalLeads,
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