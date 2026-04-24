import { Router } from 'express';
import { getAuditLogs } from './audit-logs.controller';
import { roleMiddleware } from '../../middleware/role.middleware';

const router = Router();

router.get('/', roleMiddleware(['SUPER_ADMIN']), getAuditLogs);

export default router;
