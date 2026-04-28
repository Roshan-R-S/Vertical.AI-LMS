import { Request, Response } from 'express';
import { prisma } from '../../prisma';
import { asyncHandler } from '../../utils/async-handler';

export const getAllInteractions = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;

  // Scope interactions by role — prevent data leakage across users
  const where: any = { deletedAt: null };
  if (user.role === 'BDE') {
    where.performedById = user.id;
  } else if (user.role === 'TEAM_LEAD') {
    where.performedBy = { teamId: user.teamId };
  } else if (user.role === 'CHANNEL_PARTNER') {
    where.OR = [
      { lead: { assignedToId: user.id } },
      { client: { accountManagerId: user.id } },
    ];
  }

  const interactions = await prisma.interaction.findMany({
    where,
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
