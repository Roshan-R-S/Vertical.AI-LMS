import { prisma } from '../../prisma';

export const InvoiceRepo = {
  findAll: (skip = 0, take = 20) => {
    return prisma.invoice.findMany({
      include: { client: true },
      orderBy: { date: 'desc' },
      skip,
      take,
    });
  },

  findById: (id: string) =>
    prisma.invoice.findUnique({
      where: { id },
      include: { client: true },
    }),

  create: (data: any) => prisma.invoice.create({ data }),

  update: (id: string, data: any) =>
    prisma.invoice.update({
      where: { id },
      data,
    }),

  delete: (id: string) => prisma.invoice.delete({ where: { id } }),

  count: () => prisma.invoice.count(),
};
