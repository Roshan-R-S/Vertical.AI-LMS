import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🔍 Checking database contents...\n');

  try {
    // Check users
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, isActive: true, isPending: true }
    });
    console.log('👥 Users:', users.length);
    users.forEach(u => console.log(`  - ${u.name} (${u.email}) - ${u.role} - Active: ${u.isActive} - Pending: ${u.isPending}`));

    // Check milestones
    const milestones = await prisma.milestone.findMany({
      select: { id: true, name: true, order: true }
    });
    console.log('\n🎯 Milestones:', milestones.length);
    milestones.forEach(m => console.log(`  - ${m.name} (order: ${m.order})`));

    // Check dispositions
    const dispositions = await prisma.disposition.findMany({
      select: { id: true, name: true, isActive: true },
      include: { milestone: { select: { name: true } } }
    });
    console.log('\n📋 Dispositions:', dispositions.length);
    dispositions.forEach(d => console.log(`  - ${d.name} (${d.milestone.name}) - Active: ${d.isActive}`));

    // Check leads
    const leads = await prisma.lead.count();
    console.log('\n🎯 Leads:', leads);

    // Check clients
    const clients = await prisma.client.count();
    console.log('🏢 Clients:', clients);

    // Check teams
    const teams = await prisma.team.findMany({
      select: { id: true, name: true }
    });
    console.log('\n👥 Teams:', teams.length);
    teams.forEach(t => console.log(`  - ${t.name}`));

    // Check system settings
    const settings = await prisma.systemSetting.findMany({
      select: { key: true, value: true }
    });
    console.log('\n⚙️ System Settings:', settings.length);
    settings.forEach(s => console.log(`  - ${s.key}: ${s.value}`));

    console.log('\n✅ Database check completed!');
  } catch (error) {
    console.error('❌ Database check failed:', error);
  }
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());