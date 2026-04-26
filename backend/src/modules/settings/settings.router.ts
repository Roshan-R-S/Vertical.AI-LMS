import { Router } from 'express';
import * as settingsController from './settings.controller';

const router = Router();

router.get('/', settingsController.getSettings);
router.patch('/', settingsController.updateSettings);

export default router;
