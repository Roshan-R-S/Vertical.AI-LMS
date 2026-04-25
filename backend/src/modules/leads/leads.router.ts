import { Router } from 'express';
import {
  getLeads, getLeadById, createLead, updateLead, deleteLead,
  getLeadInteractions, createLeadInteraction,
  getLeadTasks, createLeadTask,
  convertLeadToClient,
} from './leads.controller';

const router = Router();

router.get('/', getLeads);
router.post('/', createLead);
router.get('/:id', getLeadById);
router.patch('/:id', updateLead);
router.delete('/:id', deleteLead);

// Sub-resources
router.get('/:id/interactions', getLeadInteractions);
router.post('/:id/interactions', createLeadInteraction);
router.get('/:id/tasks', getLeadTasks);
router.post('/:id/tasks', createLeadTask);
router.post('/:id/convert', convertLeadToClient);

export default router;
