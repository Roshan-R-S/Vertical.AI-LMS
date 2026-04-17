import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, './.env') });

const connectionString = process.env.DATABASE_URL!;
if (!connectionString) {
  console.error("No DATABASE_URL found in .env");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Deleting all leads and their associated data (cascading)...');
  const result = await prisma.lead.deleteMany({});
  console.log(`Successfully deleted ${result.count} leads.`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
