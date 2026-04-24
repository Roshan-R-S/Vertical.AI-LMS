import { Router } from 'express';
import { getInvoices, createInvoice, markInvoicePaid } from './invoices.controller';

const router = Router();

router.get('/', getInvoices);
router.post('/', createInvoice);
router.patch('/:id/mark-paid', markInvoicePaid);

export default router;
