import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { AuthController } from './auth.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many authentication attempts, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

const router = Router();

/**
 * @openapi
 * /api/v1/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     responses:
 *       201:
 *         description: Registered successfully
 */
router.post('/register', authLimiter, AuthController.register);

/**
 * @openapi
 * /api/v1/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: User login
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post('/login', authLimiter, AuthController.login);

/**
 * @openapi
 * /api/v1/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get current user profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/me', authMiddleware, AuthController.getMe);

router.get('/approve', AuthController.approve);
router.get('/deny', AuthController.deny);

router.post('/forgot-password', authLimiter, AuthController.forgotPassword);
router.post('/reset-password', authLimiter, AuthController.resetPassword);
router.post('/change-password', authMiddleware, AuthController.changePassword);

export default router;
