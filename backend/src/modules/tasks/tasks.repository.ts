import { prisma } from '../../prisma';

export const TaskRepo = {
  findAll: async (filters: any) => {
    return prisma.task.findMany({
      where: {
        leadId: filters.leadId,
        createdBy: filters.createdBy,
        status: filters.status,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        creator: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });
  },

  findById: async (id: string) => {
    return prisma.task.findUnique({
      where: { id },
      include: {
        creator: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });
  },

  create: async (data: any) => {
    try {
      console.log('TaskRepo.create: Attempting transaction with data:', JSON.stringify(data, null, 2));
      return await prisma.$transaction(async (tx) => {
        // 1. Create the task
        const task = await tx.task.create({
          data,
          include: {
            creator: {
              select: { id: true, name: true, avatar: true },
            },
          },
        });

        console.log('TaskRepo.create: Task created in tx:', task.id);

        // 2. Create an activity record
        await tx.activity.create({
          data: {
            leadId: task.leadId,
            type: 'TASK',
            content: `Task created: ${task.title} (Priority: ${task.priority}, Due: ${task.dueDate.toISOString()})`,
            createdBy: task.createdBy,
          },
        });

        console.log('TaskRepo.create: Activity created in tx');
        return task;
      });
    } catch (error: any) {
      console.error('TaskRepo.create error (caught):', error.message);
      if (error.stack) console.error(error.stack);
      throw error;
    }
  },

  update: async (id: string, data: any) => {
    return prisma.$transaction(async (tx) => {
      const oldTask = await tx.task.findUnique({ where: { id } });
      const task = await tx.task.update({
        where: { id },
        data,
        include: {
          creator: {
            select: { id: true, name: true, avatar: true },
          },
        },
      });

      // If status changed to COMPLETED, record it
      if (oldTask?.status !== 'COMPLETED' && task.status === 'COMPLETED') {
        await tx.activity.create({
          data: {
            leadId: task.leadId,
            type: 'TASK',
            content: `Task completed: ${task.title}`,
            createdBy: task.createdBy, // In a real app, this should be the user who completed it
          },
        });
      }

      return task;
    });
  },

  delete: async (id: string) => {
    return prisma.task.delete({
      where: { id },
    });
  },
};
