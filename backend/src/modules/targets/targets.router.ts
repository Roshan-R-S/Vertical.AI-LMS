import { Router } from 'express';
import { getTargets, setTarget } from './targets.controller';

const router = Router();

router.get('/', getTargets);
router.post('/', setTarget);

export default router;
