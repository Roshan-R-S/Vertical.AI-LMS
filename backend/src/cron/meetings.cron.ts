import cron from 'node-cron';
import { prisma } from '../prisma';
import { sendMeetingDueEmail } from '../services/mailer';
import { logAudit } from '../modules/audit-logs/audit-logs.service';

export const initCronJobs = () => {
  // Run every minute at the start of the minute
  cron.schedule('* * * * *', async () => {
    try {
      const overdueMeetings = await prisma.lead.findMany({
        where: {
          stage: 'MEETING_SCHEDULED',
          meetingNotified: false,
          nextFollowUp: {
            lte: new Date(),
          },
        },
        include: {
          assignedTo: {
            select: { name: true, email: true }
          }
        }
      });

      if (overdueMeetings.length > 0) {
        console.log(`[Cron] Found ${overdueMeetings.length} overdue meetings. Sending automated emails...`);
        
        for (const lead of overdueMeetings) {
          try {
            if (lead.assignedTo?.email) {
              await sendMeetingDueEmail(lead.assignedTo.email, lead.assignedTo.name, lead.name);
              await logAudit('system', 'AUTO_MEETING_REMINDER', 'LEAD', lead.id, `Automated meeting reminder sent for lead ${lead.name}`);
            }
          } catch (itemError) {
            console.error(`[Cron] Error processing reminder for lead ${lead.id}:`, itemError);
          }
        }

        // Mark them all as notified in one batch
        await prisma.lead.updateMany({
          where: {
            id: { in: overdueMeetings.map(l => l.id) },
          },
          data: {
            meetingNotified: true,
          },
        });
        
        console.log(`[Cron] Successfully processed ${overdueMeetings.length} meetings.`);
      }
    } catch (error) {
      console.error('[Cron Error] Failed to process overdue meetings:', error);
    }
  });

  console.log('Meeting reminders cron job initialized.');
};
