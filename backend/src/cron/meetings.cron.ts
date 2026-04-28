import cron from 'node-cron';
import { prisma } from '../prisma';
import { notify } from '../utils/notify';

export const initCronJobs = () => {
  // Run every hour — mark tasks overdue and send notifications
  cron.schedule('0 * * * *', async () => {
    try {
      const overdueTasks = await prisma.task.findMany({
        where: { status: 'pending', dueDate: { lt: new Date() } },
        include: { lead: { select: { companyName: true } } },
      });

      if (overdueTasks.length > 0) {
        await prisma.task.updateMany({
          where: { status: 'pending', dueDate: { lt: new Date() } },
          data: { status: 'overdue' },
        });

        for (const task of overdueTasks) {
          const leadLabel = task.lead ? ` for lead "${task.lead.companyName}"` : '';
          await notify(task.assignedToId, `Task overdue: "${task.title}"${leadLabel}`, 'danger');
        }

        console.log(`[Cron] Marked ${overdueTasks.length} tasks as overdue.`);
      }
    } catch (error) {
      console.error('[Cron Error] Failed to update overdue tasks:', error);
    }
  });

  // Run daily at 9am — notify about client renewals due within 30 days
  cron.schedule('0 9 * * *', async () => {
    try {
      const in30Days = new Date();
      in30Days.setDate(in30Days.getDate() + 30);

      const renewalClients = await prisma.client.findMany({
        where: {
          deletedAt: null,
          status: { not: 'churned' },
          renewalDate: { gte: new Date(), lte: in30Days },
        },
      });

      for (const client of renewalClients) {
        if (client.accountManagerId) {
          await notify(
            client.accountManagerId,
            `Client "${client.companyName}" renewal is due on ${new Date(client.renewalDate!).toLocaleDateString('en-IN')}`,
            'warning'
          );
        }
      }

      if (renewalClients.length > 0) {
        console.log(`[Cron] Sent renewal reminders for ${renewalClients.length} clients.`);
      }
    } catch (error) {
      console.error('[Cron Error] Failed to send renewal reminders:', error);
    }
  });

  console.log('Cron jobs initialized.');
};
