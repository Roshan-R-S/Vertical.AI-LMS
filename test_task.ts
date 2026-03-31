import { prisma } from './backend/src/prisma';
import { TaskRepo } from './backend/src/modules/tasks/tasks.repository';

async function test() {
  try {
    const lead = await prisma.lead.findFirst();
    const user = await prisma.user.findFirst();

    if (!lead || !user) {
      console.log('No lead or user found to test with.');
      return;
    }

    console.log(`Testing Task creation for Lead: ${lead.id}, User: ${user.id}`);

    const task = await TaskRepo.create({
      leadId: lead.id,
      title: 'TEST TASK',
      dueDate: new Date().toISOString(),
      priority: 'LOW',
      createdBy: user.id
    });

    console.log('Task created successfully:', task.id);
  } catch (err) {
    console.error('TEST FAILED:', err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
