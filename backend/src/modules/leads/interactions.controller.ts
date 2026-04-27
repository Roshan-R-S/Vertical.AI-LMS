import { Request, Response } from 'express';
import { prisma } from '../../prisma';
import { asyncHandler } from '../../utils/async-handler';

export const getAllInteractions = asyncHandler(async (req: Request, res: Response) => {
  const interactions = await prisma.interaction.findMany({
    include: { performedBy: true },
    orderBy: { createdAt: 'desc' },
  });

  return res.json(interactions.map(i => ({
    id: i.id,
    leadId: i.leadId,
    clientId: i.clientId,
    type: i.type,
    direction: i.direction,
    subject: i.subject,
    summary: i.summary,
    duration: i.duration,
    sentiment: i.sentiment,
    hasTranscript: i.hasTranscript,
    hasRecording: i.hasRecording,
    performedById: i.performedById,
    by: (i as any).performedBy?.name ?? null,
    date: i.createdAt.toLocaleString('en-IN'),
  })));
});
