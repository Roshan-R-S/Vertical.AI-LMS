import { prisma } from '../../prisma';

export const ClientRepo = {
  findAll: (skip = 0, take = 20) => {
    return prisma.client.findMany({
      orderBy: { updatedAt: 'desc' },
      skip,
      take,
    });
  },

  findById: (id: string) =>
    prisma.client.findUnique({
      where: { id },
      include: {
        invoices: { orderBy: { date: 'desc' } },
      },
    }),

  create: (data: any) => prisma.client.create({ data }),

  update: (id: string, data: any) =>
    prisma.client.update({
      where: { id },
      data,
    }),

  delete: (id: string) => prisma.client.delete({ where: { id } }),

  count: () => prisma.client.count(),
};
