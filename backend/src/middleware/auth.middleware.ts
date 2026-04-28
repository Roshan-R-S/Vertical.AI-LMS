import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { prisma } from '../prisma';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const queryToken = req.query.token as string;
  
  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (queryToken) {
    token = queryToken;
  }

  if (!token) {
    console.log(`❌ Auth failed for ${req.method} ${req.path}: No token provided`);
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as { userId: string };
    
    // Fetch full user for RBAC scoping
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { team: true }
    });

    if (!user) {
      console.log(`❌ Auth failed for ${req.method} ${req.path}: User not found (${decoded.userId})`);
      return res.status(401).json({ error: 'User not found.' });
    }

    if (!user.isActive && user.role !== 'SUPER_ADMIN') {
      console.log(`❌ Auth failed for ${req.method} ${req.path}: User inactive (${user.email})`);
      return res.status(401).json({ error: 'Account deactivated.' });
    }

    console.log(`✅ Auth success for ${req.method} ${req.path}: ${user.email} (${user.role})`);
    (req as any).user = user;
    next();
  } catch (error: any) {
    console.log(`❌ Auth failed for ${req.method} ${req.path}: ${error.message}`);
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
};
