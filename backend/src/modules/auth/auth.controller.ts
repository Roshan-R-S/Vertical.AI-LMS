import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../prisma';
import { config } from '../../config';
import { displayToRole, formatUser } from '../../utils/roleDisplay';
import { asyncHandler } from '../../utils/async-handler';

const JWT_EXPIRY = '7d';

function signToken(userId: string) {
  return jwt.sign({ userId }, config.jwt.secret, { expiresIn: JWT_EXPIRY });
}


// POST /api/v1/auth/demo-login — role picker (no password)
export const demoLogin = asyncHandler(async (req: Request, res: Response) => {
  const { role } = req.body;
  if (!role) return res.status(400).json({ error: 'Role is required' });

  const prismaRole = displayToRole(role);
  const user = await prisma.user.findFirst({
    where: { 
      role: prismaRole, 
      // TEMPORARY: Allow super admin login even if inactive to fix lockout
      ...(prismaRole !== 'SUPER_ADMIN' && { isActive: true }) 
    },
    include: { team: true }
  });

  if (!user) return res.status(404).json({ error: `No active user found for role: ${role}` });

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

  const token = signToken(user.id);
  return res.json({ token, user: formatUser(user) });
});

// POST /api/v1/auth/login — email + password
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

  const user = await prisma.user.findUnique({ 
    where: { email },
    include: { team: true }
  });
  if (!user || !user.isActive) return res.status(401).json({ error: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

  const token = signToken(user.id);
  return res.json({ token, user: formatUser(user) });
});

// GET /api/v1/auth/me
export const me = asyncHandler(async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, config.jwt.secret) as { userId: string };
    const user = await prisma.user.findUnique({ 
      where: { id: payload.userId },
      include: { team: true }
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({ user: formatUser(user) });
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
});
