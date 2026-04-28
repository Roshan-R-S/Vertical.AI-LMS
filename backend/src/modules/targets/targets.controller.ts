import { Request, Response } from 'express';
import { prisma } from '../../prisma';
import { asyncHandler } from '../../utils/async-handler';
import crypto from 'crypto';

// GET /api/v1/targets
export const getTargets = asyncHandler(async (req: Request, res: Response) => {
  const targets = await prisma.target.findMany({
    include: {
      user: { include: { team: true } },
      setBy: true,
    },
    orderBy: [{ year: 'desc' }, { month: 'desc' }],
  });

  return res.json(targets.map(t => ({
    id: t.id,
    userId: t.userId,
    userName: t.user.name,
    userRole: t.user.role,
    userAvatar: t.user.avatar,
    userTeam: t.user.team?.name ?? null,
    month: t.month,
    year: t.year,
    amount: t.amount,
    setById: t.setById,
    setByName: t.setBy?.name ?? null,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  })));
});

// POST /api/v1/targets — upsert a target for a user/month/year
export const setTarget = asyncHandler(async (req: Request, res: Response) => {
  const setById = (req as any).user.id;
  const { userId, month, year, amount } = req.body;

  if (!userId || !month || !year || amount === undefined) {
    return res.status(400).json({ error: 'userId, month, year and amount are required' });
  }

  const target = await prisma.target.upsert({
    where: { userId_month_year: { userId, month: Number(month), year: Number(year) } },
    update: { amount: Number(amount), setById },
    create: {
      id: crypto.randomBytes(12).toString('hex'),
      userId,
      month: Number(month),
      year: Number(year),
      amount: Number(amount),
      setById,
    },
    include: {
      user: { include: { team: true } },
      setBy: true,
    },
  });

  return res.json({
    id: target.id,
    userId: target.userId,
    userName: target.user.name,
    userRole: target.user.role,
    userAvatar: target.user.avatar,
    userTeam: target.user.team?.name ?? null,
    month: target.month,
    year: target.year,
    amount: target.amount,
    setById: target.setById,
    setByName: target.setBy?.name ?? null,
    createdAt: target.createdAt,
    updatedAt: target.updatedAt,
  });
});
