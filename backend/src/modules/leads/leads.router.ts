import { Router } from 'express';
import {
    bulkCreateLeads,
    convertLeadToClient,
    createLead,
    createLeadInteraction,
    createLeadTask,
    deleteLead,
    getLeadById,
    getLeadInteractions,
    getLeads,
    getLeadTasks,
    updateLead
} from './leads.controller';

import { validate } from '../../middleware/validate.middleware';
import { LeadCreateSchema, LeadUpdateSchema } from './leads.schema';

const router = Router();

router.get('/', getLeads);
router.post('/', validate(LeadCreateSchema), createLead);
router.post('/bulk', bulkCreateLeads);
router.get('/:id', getLeadById);
router.patch('/:id', validate(LeadUpdateSchema), updateLead);
router.delete('/:id', deleteLead);

// Sub-resources
router.get('/:id/interactions', getLeadInteractions);
router.post('/:id/interactions', createLeadInteraction);
router.get('/:id/tasks', getLeadTasks);
router.post('/:id/tasks', createLeadTask);
router.post('/:id/convert', convertLeadToClient);

export default router;
