import { prisma } from '../src/prisma';

async function main() {
  const milestone = await prisma.milestone.findFirst({ where: { name: 'Demo Postponed' } });
  if (!milestone) { console.log('Demo Postponed milestone not found'); return; }

  const existing = await prisma.disposition.findFirst({
    where: { milestoneId: milestone.id, name: 'Follow Up' }
  });

  if (existing) {
    console.log('Follow Up disposition already exists for Demo Postponed');
    return;
  }

  const disposition = await prisma.disposition.create({
    data: {
      milestoneId: milestone.id,
      name: 'Follow Up',
      type: 'neutral',
      isDefault: true,
      isActive: true,
    }
  });

  console.log('Created:', disposition.name, 'for Demo Postponed');
}

main().catch(console.error).finally(() => prisma.$disconnect());
