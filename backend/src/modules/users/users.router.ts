import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { roleMiddleware } from '../../middleware/role.middleware';
import * as UsersController from './users.controller';

const router = Router();

router.use(authMiddleware);
router.use(roleMiddleware(['SUPER_ADMIN', 'SALES_ADMIN']));

router.get('/', UsersController.getAllUsers);
router.post('/', UsersController.createUser);
router.get('/:id', UsersController.getUserById);
router.put('/:id', UsersController.updateUser);
router.delete('/:id', UsersController.deleteUser);
router.patch('/:id/toggle-active', UsersController.toggleUserActive);

export default router;