import { prisma } from '../../prisma';

export const AuditLogRepo = {
  async create(data: { userId: string, action: string, entityType: string, entityId?: string, details?: string }) {
    return prisma.auditLog.create({ data });
  },

  async findAll(query: any) {
    const { skip, take, userId, teamId, entityType, action } = query;
    return prisma.auditLog.findMany({
      where: {
        userId: userId || undefined,
        user: teamId ? { teamId } : undefined,
        entityType: entityType === 'ALL' ? undefined : entityType,
        action: action || undefined,
      },
      include: {
        user: {
          select: { id: true, name: true, role: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take
    });
  },

  async count(query: any) {
    const { userId, teamId, entityType, action } = query;
    return prisma.auditLog.count({
      where: {
        userId: userId || undefined,
        user: teamId ? { teamId } : undefined,
        entityType: entityType === 'ALL' ? undefined : entityType,
        action: action || undefined,
      }
    });
  }
};
