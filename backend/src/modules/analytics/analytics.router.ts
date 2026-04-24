import { Router } from 'express';
import { getDashboard, getLeaderboard, getTeamPerformance } from './analytics.controller';

const router = Router();

router.get('/dashboard', getDashboard);
router.get('/leaderboard', getLeaderboard);
router.get('/team-performance', getTeamPerformance);

export default router;
