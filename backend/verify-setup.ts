import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🔍 Verifying database setup...\n');

  try {
    // Check users
    const userCount = await prisma.user.count();
    console.log(`👥 Users: ${userCount}`);
    
    if (userCount > 0) {
      const users = await prisma.user.findMany({
        select: { name: true, email: true, role: true }
      });
      users.forEach(u => console.log(`  - ${u.name} (${u.email}) - ${u.role}`));
    }

    // Check milestones
    const milestoneCount = await prisma.milestone.count();
    console.log(`\n🎯 Milestones: ${milestoneCount}`);

    // Check dispositions
    const dispositionCount = await prisma.disposition.count();
    console.log(`📋 Dispositions: ${dispositionCount}`);

    // Check system settings
    const settingCount = await prisma.systemSetting.count();
    console.log(`⚙️ System Settings: ${settingCount}`);

    // Check other data
    const leadCount = await prisma.lead.count();
    const clientCount = await prisma.client.count();
    const teamCount = await prisma.team.count();
    
    console.log(`\n📊 Data Summary:`);
    console.log(`  - Leads: ${leadCount}`);
    console.log(`  - Clients: ${clientCount}`);
    console.log(`  - Teams: ${teamCount}`);

    console.log('\n✅ Database verification completed!');
    
    if (userCount === 0) {
      console.log('\n🚀 Ready for first-time setup!');
      console.log('1. Start frontend: npm run dev');
      console.log('2. Go to http://localhost:5173');
      console.log('3. You will be redirected to /signup');
      console.log('4. Create your Super Admin account');
    } else {
      console.log('\n⚠️ Users already exist. Run reset-database.ts if you want a fresh start.');
    }

  } catch (error) {
    console.error('❌ Verification failed:', error);
  }
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());