import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🚀 Initializing database...\n');

  try {
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await prisma.interaction.deleteMany({});
    await prisma.task.deleteMany({});
    await prisma.lead.deleteMany({});
    await prisma.client.deleteMany({});
    await prisma.disposition.deleteMany({});
    await prisma.milestone.deleteMany({});
    await prisma.systemSetting.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.team.deleteMany({});

    // Create system settings
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

    // Create teams
    console.log('👥 Creating teams...');
    const teamAlpha = await prisma.team.create({
      data: { name: 'Team Alpha' }
    });
    const teamBeta = await prisma.team.create({
      data: { name: 'Team Beta' }
    });

    // Create users
    console.log('👤 Creating users...');
    const hash = await bcrypt.hash('Admin@123', 10);

    const admin = await prisma.user.create({
      data: {
        name: 'System Administrator',
        email: 'admin@lendkraft.com',
        passwordHash: hash,
        role: 'SUPER_ADMIN',
        avatar: 'SA',
        isActive: true,
      }
    });

    const teamLead1 = await prisma.user.create({
      data: {
        name: 'John Smith',
        email: 'john@lendkraft.com',
        passwordHash: hash,
        role: 'TEAM_LEAD',
        avatar: 'JS',
        teamId: teamAlpha.id,
        isActive: true,
      }
    });

    const bde1 = await prisma.user.create({
      data: {
        name: 'Sarah Johnson',
        email: 'sarah@lendkraft.com',
        passwordHash: hash,
        role: 'BDE',
        avatar: 'SJ',
        teamId: teamAlpha.id,
        isActive: true,
      }
    });

    const cp1 = await prisma.user.create({
      data: {
        name: 'Test Channel Partner',
        email: 'cp@test.com',
        passwordHash: await bcrypt.hash('Test@123', 10),
        role: 'CHANNEL_PARTNER',
        avatar: 'TCP',
        isActive: true,
        isPending: false,
        companyName: 'Test Company',
      }
    });

    // Create milestones
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

    // Create sample leads
    console.log('🎯 Creating sample leads...');
    const sampleLeads = [
      {
        companyName: 'TechCorp Solutions',
        contactName: 'Mike Wilson',
        email: 'mike@techcorp.com',
        phone: '+1-555-0101',
        source: 'Website',
        milestone: 'New',
        assignedTo: bde1.id,
        value: 50000,
        probability: 30,
        priority: 'Medium' as const,
        status: 'active' as const,
      },
      {
        companyName: 'Global Industries',
        contactName: 'Lisa Chen',
        email: 'lisa@global.com',
        phone: '+1-555-0102',
        source: 'LinkedIn',
        milestone: 'First Call',
        assignedTo: bde1.id,
        value: 75000,
        probability: 50,
        priority: 'High' as const,
        status: 'active' as const,
      }
    ];

    for (const lead of sampleLeads) {
      const milestone = milestones[lead.milestone];
      const disposition = await prisma.disposition.findFirst({
        where: { milestoneId: milestone.id, isDefault: true }
      });

      await prisma.lead.create({
        data: {
          companyName: lead.companyName,
          contactName: lead.contactName,
          email: lead.email,
          phone: lead.phone,
          source: lead.source,
          milestoneId: milestone.id,
          dispositionId: disposition?.id,
          assignedToId: lead.assignedTo,
          createdById: admin.id,
          value: lead.value,
          probability: lead.probability,
          priority: lead.priority,
          status: lead.status,
        }
      });
    }

    console.log('\n✅ Database initialization completed successfully!');
    console.log('\n🔑 Login Credentials:');
    console.log('Super Admin: admin@lendkraft.com / Admin@123');
    console.log('Team Lead: john@lendkraft.com / Admin@123');
    console.log('BDE: sarah@lendkraft.com / Admin@123');
    console.log('Channel Partner: cp@test.com / Test@123');

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());