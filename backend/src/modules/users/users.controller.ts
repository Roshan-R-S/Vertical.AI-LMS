import { Request, Response } from 'express';
import { prisma } from '../../prisma';
import { formatUser, displayToRole } from '../../utils/roleDisplay';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { asyncHandler } from '../../utils/async-handler';
import { sendWelcomeEmail } from '../../services/mailer';

// GET /api/v1/users
export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const role = req.query.role as string | undefined;
  const team = req.query.team as string | undefined;
  const status = req.query.status as string | undefined;
  const search = req.query.search as string | undefined;

  const users = await prisma.user.findMany({
    where: {
      ...(role && { role: displayToRole(role) }),
      ...(team && { team: { name: team } }),
      ...(status && { isActive: status === 'active' }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
    },
    include: { team: true },
    orderBy: { createdAt: 'asc' },
  });
  return res.json(users.map(formatUser));
});

// POST /api/v1/users
export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, role, phone, teamId } = req.body;
  if (!name || !email || !role) {
    return res.status(400).json({ error: 'name, email and role are required' });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: 'A user with this email already exists' });

  // Generate a random unusable password + a set-password token valid for 24h
  const passwordHash = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10);
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
  const avatar = name.split(' ').map((n: string) => n[0]).join('').toUpperCase();

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: displayToRole(role),
      avatar,
      isActive: true,
      ...(phone && { phone }),
      ...(teamId && { teamId }),
      passwordResetToken: resetToken,
      passwordResetExpiresAt: resetExpiry,
    },
    include: { team: true },
  });

  // Send welcome email with set-password link — non-blocking
  sendWelcomeEmail(email, name, role, resetToken).catch(err =>
    console.error('Welcome email failed:', err)
  );

  return res.status(201).json(formatUser(user));
});

// PATCH /api/v1/users/:id
export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email, phone, teamId, role } = req.body;
  const user = await prisma.user.update({
    where: { id: id as string },
    data: {
      ...(name && { name }),
      ...(email && { email }),
      ...(phone && { phone }),
      ...(teamId !== undefined && { teamId }),
      ...(role && { role: displayToRole(role) }),
    },
    include: { team: true },
  });
  return res.json(formatUser(user));
});

// DELETE /api/v1/users/:id
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const currentUserId = (req as any).user.id;

  if (id === currentUserId) {
    return res.status(400).json({ error: 'You cannot delete your own account.' });
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return res.status(404).json({ error: 'User not found' });

  // Unassign leads, tasks, clients before deleting
  await prisma.lead.updateMany({ where: { assignedToId: id }, data: { assignedToId: currentUserId } });
  await prisma.task.updateMany({ where: { assignedToId: id }, data: { assignedToId: currentUserId } });
  await prisma.client.updateMany({ where: { accountManagerId: id }, data: { accountManagerId: null } });

  await prisma.user.delete({ where: { id } });
  return res.json({ success: true });
});

// PATCH /api/v1/users/:id/status — toggle active/inactive
export const toggleUserStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const currentUserId = (req as any).user.id;

  if (id === currentUserId) {
    return res.status(400).json({ error: 'You cannot deactivate your own account.' });
  }

  const user = await prisma.user.findUnique({ where: { id: id as string } });
  if (!user) return res.status(404).json({ error: 'User not found' });
  const updated = await prisma.user.update({
    where: { id: id as string },
    data: { isActive: !user.isActive },
    include: { team: true },
  });
  return res.json(formatUser(updated));
});
