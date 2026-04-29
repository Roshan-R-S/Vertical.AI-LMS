import cron from 'node-cron';
import { prisma } from '../prisma';

export const initCronJobs = () => {
  // Run every hour — mark tasks overdue and notify assignees
  cron.schedule('0 * * * *', async () => {
    try {
      // Find pending tasks that are past due
      const overdueTasks = await prisma.task.findMany({
        where: {
          status: 'pending',
          dueDate: { lt: new Date() },
        },
        include: {
          lead: { select: { companyName: true } },
        },
      });

      if (overdueTasks.length === 0) return;

      // Mark them all overdue
      await prisma.task.updateMany({
        where: {
          status: 'pending',
          dueDate: { lt: new Date() },
        },
        data: { status: 'overdue' },
      });

      // Send a notification to each assignee
      await prisma.notification.createMany({
        data: overdueTasks.map(task => ({
          userId: task.assignedToId,
          text: `⚠️ Task overdue: "${task.title}"${
            task.lead ? ` for ${task.lead.companyName}` : ''
          }. Please action immediately.`,
          type: 'danger',
          link: '/work-queue',
        })),
      });

      console.log(`[Cron] Marked ${overdueTasks.length} tasks as overdue and sent notifications.`);
    } catch (error) {
      console.error('[Cron Error] Failed to update overdue tasks:', error);
    }
  });

  console.log('Cron jobs initialized.');
};
