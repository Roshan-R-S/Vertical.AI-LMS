import { Request, Response, NextFunction } from 'express';

/**
 * CSRF mitigation for stateless JWT APIs.
 * Since we use Bearer token auth (not cookies), CSRF is not applicable.
 * This middleware explicitly enforces that:
 * 1. All state-changing requests must carry an Authorization header
 * 2. Requests must not rely on cookie-based session auth
 */
export const csrfGuard = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization header with Bearer token is required.' });
  }
  next();
};
