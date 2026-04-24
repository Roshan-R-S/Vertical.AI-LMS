import { Router } from 'express';
import { getClients, getClientById, createClient, updateClient } from './clients.controller';

const router = Router();

router.get('/', getClients);
router.post('/', createClient);
router.get('/:id', getClientById);
router.patch('/:id', updateClient);

export default router;
