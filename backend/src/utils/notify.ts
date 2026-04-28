import { prisma } from '../prisma';
import { NotificationType } from '@prisma/client';

export async function notify(
  userId: string,
  text: string,
  type: NotificationType = 'info'
) {
  try {
    await prisma.notification.create({ data: { userId, text, type } });
  } catch {
    // Non-critical — never block the main operation
  }
}
