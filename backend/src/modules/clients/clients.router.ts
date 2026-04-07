import { Router } from 'express';
import { ClientController } from './clients.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', ClientController.getAll);
router.post('/', ClientController.create);
router.get('/:id', ClientController.getById);
router.patch('/:id', ClientController.update);
router.delete('/:id', ClientController.remove);

export default router;
