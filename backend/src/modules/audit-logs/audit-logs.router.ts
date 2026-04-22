import { Router } from 'express';
import { getAuditLogs } from './audit-logs.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { roleMiddleware } from '../../middleware/role.middleware';

const router = Router();

router.get('/', authMiddleware, roleMiddleware(['SUPER_ADMIN', 'SALES_HEAD', 'TEAM_LEAD']), getAuditLogs);

export default router;
