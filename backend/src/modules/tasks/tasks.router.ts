import { Router } from 'express';
import { TasksController } from './tasks.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import { createTaskSchema, updateTaskSchema } from './tasks.schema';

const router = Router();

router.use(authMiddleware);

router.get('/', TasksController.getTasks);
router.post('/', validateRequest(createTaskSchema as any), TasksController.createTask);
router.patch('/:id', validateRequest(updateTaskSchema as any), TasksController.updateTask);
router.delete('/:id', TasksController.deleteTask);

export default router;
