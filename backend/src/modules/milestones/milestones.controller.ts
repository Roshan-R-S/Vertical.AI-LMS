import { Request, Response } from 'express';
import { prisma } from '../../prisma';

// GET /api/v1/milestones
export async function getMilestones(req: Request, res: Response) {
  const milestones = await prisma.milestone.findMany({
    include: { dispositions: { where: { isActive: true }, orderBy: { name: 'asc' } } },
    orderBy: { order: 'asc' },
  });
  return res.json(milestones);
}

// POST /api/v1/milestones
export async function createMilestone(req: Request, res: Response) {
  const { name, color } = req.body;
  if (!name || !color) return res.status(400).json({ error: 'name and color are required' });
  const maxOrder = await prisma.milestone.aggregate({ _max: { order: true } });
  const milestone = await prisma.milestone.create({
    data: { name, color, order: (maxOrder._max.order ?? 0) + 1 },
  });
  return res.status(201).json(milestone);
}

// PATCH /api/v1/milestones/:id
export async function updateMilestone(req: Request, res: Response) {
  const { id } = req.params;
  const { name, color, order } = req.body;
  const milestone = await prisma.milestone.update({
    where: { id: id as string },
    data: { ...(name && { name }), ...(color && { color }), ...(order && { order }) },
  });
  return res.json(milestone);
}

// DELETE /api/v1/milestones/:id
export async function deleteMilestone(req: Request, res: Response) {
  const { id } = req.params;
  const leadsCount = await prisma.lead.count({ where: { milestoneId: id as string } });
  if (leadsCount > 0) return res.status(400).json({ error: `Cannot delete: ${leadsCount} leads are in this milestone` });
  await prisma.milestone.delete({ where: { id: id as string } });
  return res.json({ success: true });
}
