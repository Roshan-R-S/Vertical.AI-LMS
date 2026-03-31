import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  const counts = await prisma.lead.groupBy({
    by: ['stage'],
    _count: { id: true }
  });
  console.log('Lead Counts by Stage:', counts);
  
  const overdueCount = await prisma.lead.count({
    where: {
      nextFollowUp: { lt: new Date() },
      NOT: {
         stage: { in: ['PAYMENT_COMPLETED', 'HANDED_OVER', 'NOT_INTERESTED', 'DND', 'LOST'] }
      }
    }
  });
  console.log('Overdue Count:', overdueCount);
}

check().catch(console.error).finally(() => prisma.$disconnect());
