import { Router } from 'express';
import * as AnalyticsController from './analytics.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { roleMiddleware } from '../../middleware/role.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/dashboard', AnalyticsController.getDashboard);

// Sensitive stats require Admin roles
router.get('/pipeline', roleMiddleware(['SUPER_ADMIN', 'SALES_ADMIN']), AnalyticsController.getPipeline);
router.get('/executives', roleMiddleware(['SUPER_ADMIN', 'SALES_ADMIN']), AnalyticsController.getExecutiveStats);

export default router;