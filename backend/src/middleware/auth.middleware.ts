import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const queryToken = req.query.token as string;
  console.log(`[AuthMiddleware-v2] ${req.method} ${req.path} - Header: ${!!authHeader}, QueryToken: ${!!queryToken}`);
  
  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    (req as any).user = decoded;
    next();
  } catch (error: any) {
    console.log(`[AuthMiddleware] Error: ${error.message}`);
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
};
