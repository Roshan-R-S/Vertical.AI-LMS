import { Request, Response, NextFunction } from 'express';
import { attachmentsService } from './attachments.service';

export async function uploadAttachment(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) {
      res.status(400).json({ statusCode: 400, message: 'No file provided.' });
      return;
    }
    const leadId = req.params.id as string;
    const uploadedById = (req as any).user.id as string;
    const attachment = await attachmentsService.upload(leadId, uploadedById, req.file, (req as any).user);
    res.status(201).json({ statusCode: 201, data: attachment, message: 'File uploaded successfully.' });
  } catch (err) {
    next(err);
  }
}

export async function listAttachments(req: Request, res: Response, next: NextFunction) {
  try {
    const leadId = req.params.id as string;
    const attachments = await attachmentsService.listByLead(leadId, (req as any).user);
    res.json({ statusCode: 200, data: attachments });
  } catch (err) {
    next(err);
  }
}

export async function downloadAttachment(req: Request, res: Response, next: NextFunction) {
  try {
    const attachmentId = req.params.attachmentId as string;
    const attachment = await attachmentsService.getForDownload(attachmentId, (req as any).user);
    res.set({
      'Content-Type': attachment.mimeType,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(attachment.fileName)}"`,
      'Content-Length': attachment.fileSize.toString(),
    });
    res.send(attachment.fileData);
  } catch (err) {
    next(err);
  }
}

export async function deleteAttachment(req: Request, res: Response, next: NextFunction) {
  try {
    const attachmentId = req.params.attachmentId as string;
    const deletedById = (req as any).user.id as string;
    await attachmentsService.remove(attachmentId, deletedById, (req as any).user);
    res.json({ statusCode: 200, message: 'Attachment deleted.' });
  } catch (err) {
    next(err);
  }
}
