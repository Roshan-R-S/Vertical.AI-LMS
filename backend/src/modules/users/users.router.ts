import { Router } from 'express';
import { getUsers, createUser, updateUser, toggleUserStatus } from './users.controller';
import { roleMiddleware } from '../../middleware/role.middleware';

const router = Router();

router.get('/', getUsers);
router.post('/', roleMiddleware(['SUPER_ADMIN']), createUser);
router.patch('/:id', roleMiddleware(['SUPER_ADMIN']), updateUser);
router.patch('/:id/status', roleMiddleware(['SUPER_ADMIN']), toggleUserStatus);

export default router;
