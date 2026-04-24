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
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as { userId: string };
    
    // Fetch full user for RBAC scoping
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { team: true },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'User not found or account deactivated.' });
    }

    (req as any).user = user;
    next();
  } catch (error: any) {
    console.log(`[AuthMiddleware] Error: ${error.message}`);
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
};
