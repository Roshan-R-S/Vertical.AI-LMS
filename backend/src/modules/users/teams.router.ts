import { Router } from 'express';
import { prisma } from '../../prisma';
import { asyncHandler } from '../../utils/async-handler';
import { roleMiddleware } from '../../middleware/role.middleware';

const router = Router();

// GET /api/v1/teams
router.get('/', asyncHandler(async (_req, res) => {
  const teams = await prisma.team.findMany({ orderBy: { name: 'asc' } });
  return res.json(teams);
}));

// POST /api/v1/teams
router.post('/', roleMiddleware(['SUPER_ADMIN']), asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Team name is required' });

  const existing = await prisma.team.findUnique({ where: { name: name.trim() } });
  if (existing) return res.status(409).json({ error: 'A team with this name already exists' });

  const team = await prisma.team.create({ data: { name: name.trim() } });
  return res.status(201).json(team);
}));

export default router;
