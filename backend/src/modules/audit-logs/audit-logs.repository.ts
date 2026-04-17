import { prisma } from '../../prisma';

export const AuditLogRepo = {
  async create(data: { userId: string | null, action: string, entityType: string, entityId?: string, details?: string }) {
    const finalUserId = (data.userId === 'system' || data.userId === null) ? null : data.userId;
    
    return prisma.auditLog.create({ 
      data: {
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        details: data.details,
        userId: finalUserId
      } as any
    });
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
