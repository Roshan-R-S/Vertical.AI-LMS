import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  const allCounts = await prisma.activity.groupBy({
    by: ['type'],
    _count: { _all: true }
  });
  console.log('Activity Counts by Type:', JSON.stringify(allCounts, null, 2));

  const total = await prisma.activity.count();
  console.log('Total Activities:', total);
  
  const sample = await prisma.activity.findMany({
    take: 20,
    orderBy: { createdAt: 'desc' },
    select: { type: true, content: true }
  });
  console.log('Recent Activity Types/Content:', JSON.stringify(sample, null, 2));
}

check().catch(console.error).finally(() => prisma.$disconnect());
