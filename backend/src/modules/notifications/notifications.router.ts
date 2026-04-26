import { Router } from 'express';
import { getNotifications, markAsRead, markAllAsRead } from './notifications.controller';

const router = Router();

router.get('/', getNotifications);
router.patch('/read-all', markAllAsRead);
router.patch('/:id/read', markAsRead);

export default router;
