import { prisma } from '../../prisma';

export const attachmentsService = {
  async upload(leadId: string | null, invoiceId: string | null, uploadedById: string, file: Express.Multer.File, user: any) {
    const attachment = await prisma.attachment.create({
      data: {
        leadId: leadId ?? undefined,
        invoiceId: invoiceId ?? undefined,
        uploadedById,
        fileName: file.originalname,
        mimeType: file.mimetype,
        fileSize: file.size,
        fileData: Buffer.from(file.buffer) as any,
      },
    });

    return {
      id: attachment.id,
      fileName: attachment.fileName,
      mimeType: attachment.mimeType,
      fileSize: attachment.fileSize,
      createdAt: attachment.createdAt,
    };
  },

  async listByLead(leadId: string, user: any) {
    const attachments = await prisma.attachment.findMany({
      where: { leadId },
      select: { id: true, fileName: true, mimeType: true, fileSize: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    return attachments;
  },

  async getForDownload(attachmentId: string, user: any) {
    const attachment = await prisma.attachment.findUnique({ where: { id: attachmentId as string } });
    if (!attachment) throw new Error('Attachment not found');
    return attachment;
  },

  async remove(attachmentId: string, deletedById: string, user: any) {
    const attachment = await prisma.attachment.findUnique({ where: { id: attachmentId as string } });
    if (!attachment) throw new Error('Attachment not found');
    await prisma.attachment.delete({ where: { id: attachmentId as string } });
  },
};
