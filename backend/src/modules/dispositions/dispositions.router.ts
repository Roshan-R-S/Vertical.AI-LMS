import { Router } from 'express';
import { getDispositions, createDisposition, updateDisposition, toggleDisposition, deleteDisposition } from './dispositions.controller';
import { roleMiddleware } from '../../middleware/role.middleware';

const router = Router();

router.get('/', getDispositions);
router.post('/', roleMiddleware(['SUPER_ADMIN']), createDisposition);
router.patch('/:id', roleMiddleware(['SUPER_ADMIN']), updateDisposition);
router.patch('/:id/toggle', roleMiddleware(['SUPER_ADMIN']), toggleDisposition);
router.delete('/:id', roleMiddleware(['SUPER_ADMIN']), deleteDisposition);

export default router;
