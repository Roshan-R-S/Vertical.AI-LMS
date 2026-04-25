import { prisma } from '../prisma';

async function test() {
  try {
    console.log('Testing DB connection...');
    const count = await prisma.lead.count();
    console.log('Lead count:', count);
    process.exit(0);
  } catch (err) {
    console.error('DB test failed:', err);
    process.exit(1);
  }
}

test();
