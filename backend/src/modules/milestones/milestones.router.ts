import { Router } from 'express';
import { getMilestones, createMilestone, updateMilestone, deleteMilestone } from './milestones.controller';
import { roleMiddleware } from '../../middleware/role.middleware';

const router = Router();

router.get('/', getMilestones);
router.post('/', roleMiddleware(['SUPER_ADMIN']), createMilestone);
router.patch('/:id', roleMiddleware(['SUPER_ADMIN']), updateMilestone);
router.delete('/:id', roleMiddleware(['SUPER_ADMIN']), deleteMilestone);

export default router;
