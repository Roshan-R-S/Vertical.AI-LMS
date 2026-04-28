import { Request, Response } from 'express';
import { prisma } from '../../prisma';
import { asyncHandler } from '../../utils/async-handler';
import { Role } from '@prisma/client';

const DEFAULT_SOURCES = ['Website', 'LinkedIn', 'Google Ads', 'Referral', 'Partner', 'API'];

async function ensureDefaults() {
  const count = await prisma.leadSource.count();
  if (count === 0) {
    await prisma.leadSource.createMany({
      data: DEFAULT_SOURCES.map(name => ({ name, isDefault: true })),
      skipDuplicates: true,
    });
  }
}

// GET /api/v1/sources
export const getSources = asyncHandler(async (_req: Request, res: Response) => {
  await ensureDefaults();
  const sources = await prisma.leadSource.findMany({
    orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
  });
  return res.json(sources);
});

// POST /api/v1/sources
export const createSource = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (user.role !== Role.SUPER_ADMIN) {
    return res.status(403).json({ error: 'Only Super Admins can add lead sources' });
  }
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'name is required' });

  const existing = await prisma.leadSource.findUnique({ where: { name: name.trim() } });
  if (existing) return res.status(409).json({ error: 'Source already exists' });

  const source = await prisma.leadSource.create({ data: { name: name.trim(), isDefault: false } });
  return res.status(201).json(source);
});

// DELETE /api/v1/sources/:id
export const deleteSource = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (user.role !== Role.SUPER_ADMIN) {
    return res.status(403).json({ error: 'Only Super Admins can delete lead sources' });
  }
  const id = req.params.id as string;
  const source = await prisma.leadSource.findUnique({ where: { id } });
  if (!source) return res.status(404).json({ error: 'Source not found' });
  if (source.isDefault) return res.status(400).json({ error: 'Cannot delete default sources' });

  await prisma.leadSource.delete({ where: { id } });
  return res.json({ success: true });
});
