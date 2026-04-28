import { Router } from 'express';
import { roleMiddleware } from '../../middleware/role.middleware';
import { prisma } from '../../prisma';
import { asyncHandler } from '../../utils/async-handler';

const router = Router();

// GET /api/v1/targets?month=&year=
router.get('/', asyncHandler(async (req, res) => {
  const month = req.query.month ? parseInt(req.query.month as string) : undefined;
  const year  = req.query.year  ? parseInt(req.query.year  as string) : undefined;

  const targets = await prisma.target.findMany({
    where: {
      ...(month !== undefined && { month }),
      ...(year  !== undefined && { year  }),
    },
    include: { user: { select: { id: true, name: true, avatar: true, role: true } } },
    orderBy: [{ year: 'desc' }, { month: 'desc' }],
  });
  return res.json(targets);
}));

// POST /api/v1/targets — upsert (create or update)
router.post('/', roleMiddleware(['SUPER_ADMIN']), asyncHandler(async (req, res) => {
  const { userId, month, year, amount } = req.body;
  if (!userId || !month || !year || amount === undefined) {
    return res.status(400).json({ error: 'userId, month, year and amount are required' });
  }

  const target = await prisma.target.upsert({
    where: { userId_month_year: { userId, month: Number(month), year: Number(year) } },
    update: { amount: Number(amount) },
    create: { userId, month: Number(month), year: Number(year), amount: Number(amount) },
    include: { user: { select: { id: true, name: true, avatar: true, role: true } } },
  });
  return res.status(201).json(target);
}));

// DELETE /api/v1/targets/:id
router.delete('/:id', roleMiddleware(['SUPER_ADMIN']), asyncHandler(async (req, res) => {
  const id = req.params.id as string;
  await prisma.target.delete({ where: { id } });
  return res.json({ success: true });
}));

export default router;
