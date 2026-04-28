import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding essential data...');

  // ─── SYSTEM SETTINGS (REQUIRED) ──────────────────────────────────
  const defaultSettings = [
    { key: 'forceDisposition', value: true },
    { key: 'blockStageSkipping', value: true },
    { key: 'autoAdvanceOnCompletion', value: false },
    { key: 'lockHistoricalData', value: true },
    { key: 'multipleDispositionsPerStage', value: false },
    { key: 'emailAlertOnStageChange', value: true },
    { key: 'autoLeadScoring', value: true },
    { key: 'followUpReminders', value: true },
    { key: 'dealRiskAlerts', value: true },
    { key: 'invoiceDueAlerts', value: true },
  ];

  for (const s of defaultSettings) {
    await prisma.systemSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: { key: s.key, value: s.value },
    });
  }
  console.log('✓ System settings seeded');

  // ─── ADMIN USER (REQUIRED) ────────────────────────────────────────
  const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@123', 10);
  
  await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@lendkraft.com' },
    update: {},
    create: {
      name: 'System Administrator',
      email: process.env.ADMIN_EMAIL || 'admin@lendkraft.com',
      passwordHash: hash,
      role: 'SUPER_ADMIN',
      avatar: 'SA',
      isActive: true,
    },
  });
  console.log('✓ Admin user created');

  // ─── MILESTONES (REQUIRED) ────────────────────────────────────────
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
    milestones[m.name] = await prisma.milestone.upsert({
      where: { name: m.name },
      update: { order: m.order, color: m.color },
      create: m,
    });
  }
  console.log('✓ Milestones seeded');

  // ─── DISPOSITIONS (REQUIRED) ──────────────────────────────────────
  // Clear existing dispositions first to avoid conflicts
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
      },
    });
  }
  console.log('✓ Dispositions seeded');

  console.log('🎉 Essential data seeded successfully!');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());