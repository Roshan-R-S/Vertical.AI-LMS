import { Router } from 'express';
import { demoLogin, login, me } from './auth.controller';

const router = Router();

router.post('/demo-login', demoLogin);
router.post('/login', login);
router.get('/me', me);

export default router;
