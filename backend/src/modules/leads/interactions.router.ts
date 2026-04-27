import { Router } from 'express';
import { getAllInteractions } from './interactions.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);
router.get('/', getAllInteractions);

export default router;
