import { Router } from 'express';
import { demoLogin, login, me, forgotPassword, resetPassword, setupStatus, signup, partnerSignup, partnerApprove, partnerReject } from './auth.controller';
import { config } from '../../config';

const router = Router();

router.get('/setup-status', setupStatus);
router.post('/signup', signup);
router.post('/login', login);

// ⚠️  Demo-login is development-only. Never available in production.
if (config.env !== 'production') {
  router.post('/demo-login', demoLogin);
}

router.get('/me', me);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/partner-signup', partnerSignup);
router.get('/partner-approve', partnerApprove);
router.get('/partner-reject', partnerReject);

export default router;
