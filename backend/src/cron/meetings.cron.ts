import cron from 'node-cron';
import { prisma } from '../prisma';

export const initCronJobs = () => {
  // Run every hour — mark tasks overdue
  cron.schedule('0 * * * *', async () => {
    try {
      const updated = await prisma.task.updateMany({
        where: {
          status: 'pending',
          dueDate: { lt: new Date() },
        },
        data: { status: 'overdue' },
      });
      if (updated.count > 0) {
        console.log(`[Cron] Marked ${updated.count} tasks as overdue.`);
      }
    } catch (error) {
      console.error('[Cron Error] Failed to update overdue tasks:', error);
    }
  });

  console.log('Cron jobs initialized.');
};
