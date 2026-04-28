import { Request, Response } from 'express';
import { config } from '../../config';
import { asyncHandler } from '../../utils/async-handler';
import { formatUser } from '../../utils/roleDisplay';
import {
  approvePartner,
  getCurrentUser,
  isSetupRequired,
  loginForDemo,
  loginWithPassword,
  rejectPartner,
  requestPasswordReset,
  signupPartner,
  signupSuperAdmin,
  updatePasswordFromResetToken,
} from './auth.service';

// GET /api/v1/auth/setup-status
export const setupStatus = asyncHandler(async (_req: Request, res: Response) => {
  const setupRequired = await isSetupRequired();
  return res.json({ setupRequired });
});

// POST /api/v1/auth/signup
export const signup = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'name, email and password are required' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }
  try {
    const { token, user } = await signupSuperAdmin({ name, email, password });
    return res.status(201).json({ token, user: formatUser(user) });
  } catch (error) {
    if (error instanceof Error && error.message === 'SETUP_COMPLETE') {
      return res.status(403).json({ error: 'Setup already complete. Please sign in.' });
    }
    if (error instanceof Error && error.message === 'EMAIL_EXISTS') {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }
    throw error;
  }
});


// POST /api/v1/auth/demo-login — role picker (no password)
// ⚠️  Development-only endpoint. Blocked entirely in production.
export const demoLogin = asyncHandler(async (req: Request, res: Response) => {
  if (config.env === 'production') {
    return res.status(403).json({ error: 'This endpoint is not available in production.' });
  }

  const { role } = req.body;
  if (!role) return res.status(400).json({ error: 'Role is required' });
  const result = await loginForDemo(role);
  if (!result) return res.status(404).json({ error: `No active user found for role: ${role}` });
  const { token, user } = result;
  return res.json({ token, user: formatUser(user) });
});

// POST /api/v1/auth/login — email + password
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
  const result = await loginWithPassword(email, password);
  if (result.kind === 'pending') {
    return res.status(403).json({ error: 'Your account is pending approval. Please wait for the admin to approve your request.' });
  }
  if (result.kind === 'invalid') {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  return res.json({ token: result.token, user: formatUser(result.user) });
});

// GET /api/v1/auth/me
export const me = asyncHandler(async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });

  const token = authHeader.split(' ')[1];
  try {
    const user = await getCurrentUser(token);
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({ user: formatUser(user) });
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
});

// POST /api/v1/auth/forgot-password
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  // Always return success to prevent email enumeration.
  await requestPasswordReset(email);
  return res.json({ message: 'If that email exists, a reset link has been sent.' });
});

// POST /api/v1/auth/reset-password
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ error: 'Token and password are required' });
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });

  const updated = await updatePasswordFromResetToken(token, password);
  if (!updated) return res.status(400).json({ error: 'Invalid or expired reset token' });

  return res.json({ message: 'Password reset successfully. You can now log in.' });
});

// POST /api/v1/auth/partner-signup
export const partnerSignup = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, phone, companyName } = req.body;
  if (!name || !email || !companyName) {
    return res.status(400).json({ error: 'name, email and companyName are required' });
  }

  const status = await signupPartner({ name, email, phone, companyName });
  if (status === 'email_exists') {
    return res.status(409).json({ error: 'An account with this email already exists' });
  }

  return res.status(201).json({ message: 'Request submitted. You will receive an email once approved.' });
});

// GET /api/v1/auth/partner-approve
export const partnerApprove = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.query;
  if (!token) return res.status(400).json({ error: 'Token is required' });

  const user = await approvePartner(token as string);
  if (!user) return res.status(404).send('<h2>Invalid or already used approval link.</h2>');
  if (user === 'already_processed') return res.status(400).send('<h2>This request has already been processed.</h2>');

  return res.send(`
    <html><body style="font-family:Arial;text-align:center;padding:60px;">
      <h2 style="color:#10b981">&#10003; Approved!</h2>
      <p>${user.name} has been approved. They will receive a welcome email shortly.</p>
    </body></html>
  `);
});

// GET /api/v1/auth/partner-reject
export const partnerReject = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.query;
  if (!token) return res.status(400).json({ error: 'Token is required' });

  const user = await rejectPartner(token as string);
  if (!user) return res.status(404).send('<h2>Invalid or already used rejection link.</h2>');
  if (user === 'already_processed') return res.status(400).send('<h2>This request has already been processed.</h2>');

  return res.send(`
    <html><body style="font-family:Arial;text-align:center;padding:60px;">
      <h2 style="color:#ef4444">&#10007; Rejected</h2>
      <p>${user.name}'s request has been rejected and their account has been removed.</p>
    </body></html>
  `);
});
