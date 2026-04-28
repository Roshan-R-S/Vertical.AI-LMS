import { Router } from 'express';
import { getSources, createSource, deleteSource } from './sources.controller';

const router = Router();

router.get('/', getSources);
router.post('/', createSource);
router.delete('/:id', deleteSource);

export default router;
