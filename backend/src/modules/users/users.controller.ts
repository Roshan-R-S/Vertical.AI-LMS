import { Request, Response } from 'express';
import { prisma } from '../../prisma';
import { formatUser, displayToRole } from '../../utils/roleDisplay';
import bcrypt from 'bcryptjs';

// GET /api/v1/users
export async function getUsers(req: Request, res: Response) {
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
}

// POST /api/v1/users
export async function createUser(req: Request, res: Response) {
  const { name, email, password, role, phone, territory, teamId } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'name, email, password and role are required' });
  }
  const passwordHash = await bcrypt.hash(password || 'Vertical@123', 10);
  const avatar = name.split(' ').map((n: string) => n[0]).join('').toUpperCase();

  const user = await prisma.user.create({
    data: {
      name, email, passwordHash,
      role: displayToRole(role),
      avatar, phone, territory,
      ...(teamId && { teamId }),
    },
    include: { team: true },
  });
  return res.status(201).json(formatUser(user));
}

// PATCH /api/v1/users/:id
export async function updateUser(req: Request, res: Response) {
  const { id } = req.params;
  const { name, email, phone, territory, teamId, role } = req.body;
  const user = await prisma.user.update({
    where: { id: id as string },
    data: {
      ...(name && { name }),
      ...(email && { email }),
      ...(phone && { phone }),
      ...(territory && { territory }),
      ...(teamId !== undefined && { teamId }),
      ...(role && { role: displayToRole(role) }),
    },
    include: { team: true },
  });
  return res.json(formatUser(user));
}

// PATCH /api/v1/users/:id/status — toggle active/inactive
export async function toggleUserStatus(req: Request, res: Response) {
  const { id } = req.params;
  const user = await prisma.user.findUnique({ where: { id: id as string } });
  if (!user) return res.status(404).json({ error: 'User not found' });
  const updated = await prisma.user.update({
    where: { id: id as string },
    data: { isActive: !user.isActive },
    include: { team: true },
  });
  return res.json(formatUser(updated));
}
