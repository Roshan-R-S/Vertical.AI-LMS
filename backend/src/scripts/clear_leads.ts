import { prisma } from '../prisma';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function main() {
  console.log('🧹 Clearing all seeded leads...');
  const deleted = await prisma.lead.deleteMany({});
  console.log(`✅ Deleted ${deleted.count} leads.`);
}

main()
  .catch((e) => {
    console.error('❌ FAILED:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
