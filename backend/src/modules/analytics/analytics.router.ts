import { Router } from 'express';
import * as AnalyticsController from './analytics.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/dashboard', AnalyticsController.getDashboard);
router.get('/pipeline', AnalyticsController.getPipeline);
router.get('/executives', AnalyticsController.getExecutiveStats);

export default router;