import { Router } from 'express';
import { getDashboard, getLeaderboard, getTeamPerformance, getTargetHistory } from './analytics.controller';

const router = Router();

router.get('/dashboard', getDashboard);
router.get('/leaderboard', getLeaderboard);
router.get('/team-performance', getTeamPerformance);
router.get('/target-history', getTargetHistory);

export default router;
