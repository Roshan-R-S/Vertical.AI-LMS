import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🧹 Resetting database for fresh start...\n');

  try {
    // Clear all user-related data
    console.log('🗑️ Clearing user data...');
    await prisma.interaction.deleteMany({});
    await prisma.task.deleteMany({});
    await prisma.lead.deleteMany({});
    await prisma.client.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.team.deleteMany({});

    // Keep system settings
    console.log('⚙️ System settings preserved');

    // Keep milestones
    const existingMilestones = await prisma.milestone.count();
    if (existingMilestones === 0) {
      console.log('🎯 Creating milestones...');
      const milestoneData = [
        { name: 'New', order: 1, color: '#6366f1' },
        { name: 'First Call', order: 2, color: '#06b6d4' },
        { name: 'Demo Scheduled', order: 3, color: '#8b5cf6' },
        { name: 'Demo Completed', order: 4, color: '#f59e0b' },
        { name: 'Proposal Shared', order: 5, color: '#3b82f6' },
        { name: 'Negotiation', order: 6, color: '#ec4899' },
        { name: 'Deal Closed', order: 7, color: '#10b981' },
        { name: 'Not Interested', order: 8, color: '#ef4444' },
      ];

      const milestones: Record<string, any> = {};
      for (const m of milestoneData) {
        milestones[m.name] = await prisma.milestone.create({ data: m });
      }

      // Create dispositions
      console.log('📋 Creating dispositions...');
      await prisma.disposition.deleteMany({});
      
      const dispositionData = [
        { milestone: 'New', name: 'Not Contacted', type: 'neutral' as const, isDefault: true },
        { milestone: 'First Call', name: 'Call Connected', type: 'positive' as const, isDefault: true },
        { milestone: 'First Call', name: 'Call Not Picked', type: 'neutral' as const, isDefault: false },
        { milestone: 'Demo Scheduled', name: 'Meeting Confirmed', type: 'positive' as const, isDefault: true },
        { milestone: 'Demo Completed', name: 'Interested', type: 'positive' as const, isDefault: true },
        { milestone: 'Proposal Shared', name: 'Proposal Sent', type: 'positive' as const, isDefault: true },
        { milestone: 'Negotiation', name: 'Price Discussion', type: 'neutral' as const, isDefault: true },
        { milestone: 'Deal Closed', name: 'Payment Received', type: 'positive' as const, isDefault: true },
        { milestone: 'Not Interested', name: 'Chose Competitor', type: 'negative' as const, isDefault: true },
      ];

      for (const d of dispositionData) {
        await prisma.disposition.create({
          data: {
            milestoneId: milestones[d.milestone].id,
            name: d.name,
            type: d.type,
            isDefault: d.isDefault,
            isActive: true,
          }
        });
      }
    }

    // Create system settings if they don't exist
    const existingSettings = await prisma.systemSetting.count();
    if (existingSettings === 0) {
      console.log('⚙️ Creating system settings...');
      const defaultSettings = [
        { key: 'forceDisposition', value: true },
        { key: 'blockStageSkipping', value: true },
        { key: 'autoAdvanceOnCompletion', value: false },
        { key: 'lockHistoricalData', value: true },
        { key: 'emailAlertOnStageChange', value: true },
        { key: 'autoLeadScoring', value: true },
        { key: 'followUpReminders', value: true },
        { key: 'dealRiskAlerts', value: true },
        { key: 'invoiceDueAlerts', value: true },
      ];

      for (const s of defaultSettings) {
        await prisma.systemSetting.create({
          data: { key: s.key, value: s.value }
        });
      }
    }

    console.log('\n✅ Database reset completed successfully!');
    console.log('\n🚀 Next Steps:');
    console.log('1. Go to http://localhost:5173');
    console.log('2. You will be redirected to /signup (first-time setup)');
    console.log('3. Create your Super Admin account');
    console.log('4. Login and start using the system');
    console.log('\n📝 The first user you create will automatically be a Super Admin');

  } catch (error) {
    console.error('❌ Database reset failed:', error);
    throw error;
  }
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());