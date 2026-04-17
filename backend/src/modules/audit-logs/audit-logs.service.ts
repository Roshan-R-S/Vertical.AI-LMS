import { AuditLogRepo } from './audit-logs.repository';

export const logAudit = async (userId: string | null, action: string, entityType: string, entityId?: string, details?: string) => {
  try {
    return await AuditLogRepo.create({ userId, action, entityType, entityId, details });
  } catch (err) {
    console.error(`[AuditLogService] Failed to log audit: ${action}`, err);
  }
};

export const getAuditLogs = async (query: any, user: any) => {
  const { page = 1, limit = 50, entityType, userId, action } = query;
  const skip = (Number(page) - 1) * Number(limit);

  // Scoping enforcement
  const findAllQuery: any = {
    skip,
    take: Number(limit),
    entityType,
    action
  };

  if (user.role === 'BDE') {
    findAllQuery.userId = user.id;
  } else if (user.role === 'TEAM_LEAD') {
    findAllQuery.teamId = user.teamId;
    if (userId) findAllQuery.userId = userId;
  } else {
    if (userId) findAllQuery.userId = userId;
  }

  const [logs, total] = await Promise.all([
    AuditLogRepo.findAll(findAllQuery),
    AuditLogRepo.count(findAllQuery)
  ]);

  return {
    data: logs,
    meta: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit))
    }
  };
};
