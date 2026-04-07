import { Request, Response } from 'express';
import { getAuditLogs as getAuditLogsService } from './audit-logs.service';

export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const result = await getAuditLogsService(req.query, (req as any).user);
    res.json({
      status: 'success',
      data: result.data,
      meta: result.meta
    });
  } catch (error: any) {
    console.error('[AuditLogController] Fetch error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch audit logs'
    });
  }
};
