import { Router } from 'express';
import { InvoiceController } from './invoices.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', InvoiceController.getAll);
router.post('/', InvoiceController.create);
router.get('/:id', InvoiceController.getById);
router.patch('/:id', InvoiceController.update);
router.delete('/:id', InvoiceController.remove);

export default router;
