import { prisma } from '../../prisma';

export const attachmentsRepository = {
  async create(data: {
    leadId: string;
    uploadedById: string;
    fileName: string;
    mimeType: string;
    fileSize: number;
    fileData: Buffer | Uint8Array;
  }) {
    return prisma.attachment.create({
      data: {
        ...data,
        // Normalise to a plain Buffer so Prisma's arraybuffer type is satisfied
        fileData: Buffer.from(data.fileData),
      },
      select: {
        id: true,
        leadId: true,
        fileName: true,
        mimeType: true,
        fileSize: true,
        createdAt: true,
        uploadedBy: { select: { id: true, name: true } },
      },
    });
  },

  async findManyByLeadId(leadId: string) {
    return prisma.attachment.findMany({
      where: { leadId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        leadId: true,
        fileName: true,
        mimeType: true,
        fileSize: true,
        createdAt: true,
        uploadedBy: { select: { id: true, name: true } },
      },
    });
  },

  async findById(id: string) {
    return prisma.attachment.findUnique({ where: { id } });
  },

  async deleteById(id: string) {
    return prisma.attachment.delete({ where: { id } });
  },
};
