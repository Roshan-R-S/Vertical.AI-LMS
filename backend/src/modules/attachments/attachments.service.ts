import { prisma } from '../../prisma';
import { attachmentsRepository } from './attachments.repository';
import { LeadRepo } from '../leads/leads.repository';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const attachmentsService = {
  async upload(
    leadId: string,
    uploadedById: string,
    file: Express.Multer.File,
    user: any
  ) {
    const lead = await LeadRepo.findById(leadId);
    if (!lead) throw new Error('Lead not found');
    if (user.role === 'BDE' && lead.assignedToId !== user.id) throw new Error('Access denied.');
    if (user.role === 'TEAM_LEAD' && lead.teamId !== user.teamId) throw new Error('Access denied.');

    if (file.size > MAX_FILE_SIZE) {
      throw Object.assign(new Error('File size exceeds the 10 MB limit.'), { status: 413 });
    }

    const attachment = await attachmentsRepository.create({
      leadId,
      uploadedById,
      fileName: file.originalname,
      mimeType: file.mimetype,
      fileSize: file.size,
      fileData: file.buffer,
    });

    // Log to Activity History so the upload appears in the timeline
    await prisma.activity.create({
      data: {
        leadId,
        type: 'ATTACHMENT',
        content: `Attached file: ${file.originalname} (${formatFileSize(file.size)})`,
        createdBy: uploadedById,
      },
    });

    return attachment;
  },

  async listByLead(leadId: string, user: any) {
    const lead = await LeadRepo.findById(leadId);
    if (!lead) throw new Error('Lead not found');
    if (user.role === 'BDE' && lead.assignedToId !== user.id) throw new Error('Access denied.');
    if (user.role === 'TEAM_LEAD' && lead.teamId !== user.teamId) throw new Error('Access denied.');

    return attachmentsRepository.findManyByLeadId(leadId);
  },

  async getForDownload(attachmentId: string, user: any) {
    const attachment = await attachmentsRepository.findById(attachmentId);
    if (!attachment) {
      throw Object.assign(new Error('Attachment not found.'), { status: 404 });
    }

    const lead = await LeadRepo.findById(attachment.leadId);
    if (!lead) throw new Error('Lead not found');
    if (user.role === 'BDE' && lead.assignedToId !== user.id) throw new Error('Access denied.');
    if (user.role === 'TEAM_LEAD' && lead.teamId !== user.teamId) throw new Error('Access denied.');

    return attachment;
  },

  async remove(attachmentId: string, deletedById: string, user: any) {
    const attachment = await attachmentsRepository.findById(attachmentId);
    if (!attachment) {
      throw Object.assign(new Error('Attachment not found.'), { status: 404 });
    }

    const lead = await LeadRepo.findById(attachment.leadId);
    if (!lead) throw new Error('Lead not found');
    if (user.role === 'BDE' && lead.assignedToId !== user.id) throw new Error('Access denied.');
    if (user.role === 'TEAM_LEAD' && lead.teamId !== user.teamId) throw new Error('Access denied.');

    await attachmentsRepository.deleteById(attachmentId);

    // Log file removal to Activity History
    await prisma.activity.create({
      data: {
        leadId: attachment.leadId,
        type: 'ATTACHMENT_DELETED',
        content: `Removed file: ${attachment.fileName}`,
        createdBy: deletedById,
      },
    });
  },
};
