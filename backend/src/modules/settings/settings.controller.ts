import { Request, Response } from 'express';
import { prisma } from '../../prisma';
import { asyncHandler } from '../../utils/async-handler';
import { Role } from '@prisma/client';

// GET /api/v1/settings
export const getSettings = asyncHandler(async (req: Request, res: Response) => {
  const settings = await prisma.systemSetting.findMany();
  
  // Convert array to object { key: value }
  const settingsObj = settings.reduce((acc: any, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {});

  return res.json(settingsObj);
});

// PATCH /api/v1/settings
export const updateSettings = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  
  if (user.role !== Role.SUPER_ADMIN) {
    return res.status(403).json({ error: 'Only Super Admins can update system settings' });
  }

  const updates = req.body; // { key: value }

  const updatePromises = Object.entries(updates).map(([key, value]) => {
    return prisma.systemSetting.upsert({
      where: { key },
      update: { value: value as any },
      create: { key, value: value as any },
    });
  });

  await Promise.all(updatePromises);

  const allSettings = await prisma.systemSetting.findMany();
  const settingsObj = allSettings.reduce((acc: any, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {});

  return res.json(settingsObj);
});
