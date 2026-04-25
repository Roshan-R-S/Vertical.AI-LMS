import { Router } from 'express';
import { getClients, getClientById, createClient, updateClient, deleteClient } from './clients.controller';

import { validate } from '../../middleware/validate.middleware';
import { ClientCreateSchema, ClientUpdateSchema } from './clients.schema';

const router = Router();

router.get('/', getClients);
router.post('/', validate(ClientCreateSchema), createClient);
router.get('/:id', getClientById);
router.patch('/:id', validate(ClientUpdateSchema), updateClient);
router.delete('/:id', deleteClient);

export default router;
