import { Request, Response } from 'express';
import { prisma } from '../../prisma';

// GET /api/v1/dispositions?milestoneId=xxx
export async function getDispositions(req: Request, res: Response) {
  const milestoneId = req.query.milestoneId as string | undefined;

  const dispositions = await prisma.disposition.findMany({
    where: {
      isActive: true,
      ...(milestoneId && { milestoneId }),
    },
    include: { milestone: true },
    orderBy: { name: 'asc' },
  });
  return res.json(dispositions);
}

// POST /api/v1/dispositions
export async function createDisposition(req: Request, res: Response) {
  const milestoneId = req.body.milestoneId as string | undefined;
  const name = req.body.name as string | undefined;
  const type = req.body.type as string | undefined;
  const description = req.body.description as string | undefined;
  const isDefault = req.body.isDefault as boolean | undefined;
  if (!milestoneId || !name) return res.status(400).json({ error: 'milestoneId and name are required' });
  const d = await prisma.disposition.create({
    data: { milestoneId, name, type: (type || 'neutral') as any, description, isDefault: isDefault ?? false, isActive: true },
    include: { milestone: true },
  });
  return res.status(201).json(d);
}

// PATCH /api/v1/dispositions/:id
export async function updateDisposition(req: Request, res: Response) {
  const { id } = req.params;
  const { name, type, description, isDefault } = req.body;
  const d = await prisma.disposition.update({
    where: { id: id as string },
    data: {
      ...(name && { name: name as string }),
      ...(type && { type: type as any }),
      ...(description !== undefined && { description: description as string }),
      ...(isDefault !== undefined && { isDefault: isDefault as boolean }),
    },
    include: { milestone: true },
  });
  return res.json(d);
}

// PATCH /api/v1/dispositions/:id/toggle
export async function toggleDisposition(req: Request, res: Response) {
  const { id } = req.params;
  const current = await prisma.disposition.findUnique({ where: { id: id as string } });
  if (!current) return res.status(404).json({ error: 'Disposition not found' });
  const d = await prisma.disposition.update({ 
    where: { id: id as string }, 
    data: { isActive: !current.isActive }, 
    include: { milestone: true } 
  });
  return res.json(d);
}

// DELETE /api/v1/dispositions/:id (soft delete — marks inactive)
export async function deleteDisposition(req: Request, res: Response) {
  const { id } = req.params;
  const d = await prisma.disposition.update({ where: { id: id as string }, data: { isActive: false } });
  return res.json(d);
}
