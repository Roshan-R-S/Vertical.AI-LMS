import { Request, Response } from 'express';
import { prisma } from '../../prisma';
import { asyncHandler } from '../../utils/async-handler';

// GET /api/v1/notifications
export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  
  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 50
  });

  return res.json(notifications.map(n => ({
    id: n.id,
    text: n.text,
    type: n.type,
    isRead: n.isRead,
    time: formatTimeAgo(n.createdAt)
  })));
});

// PATCH /api/v1/notifications/:id/read
export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = (req as any).user;

  await prisma.notification.updateMany({
    where: { id: id as string, userId: user.id },
    data: { isRead: true }
  });

  return res.json({ success: true });
});

// PATCH /api/v1/notifications/read-all
export const markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;

  await prisma.notification.updateMany({
    where: { userId: user.id, isRead: false },
    data: { isRead: true }
  });

  return res.json({ success: true });
});

function formatTimeAgo(date: Date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}
