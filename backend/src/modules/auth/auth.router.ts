import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

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
router.post('/register', AuthController.register);

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
router.post('/login', AuthController.login);

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

export default router;
