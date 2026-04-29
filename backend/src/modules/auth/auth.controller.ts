import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../../prisma';
import { config } from '../../config';
import { displayToRole, formatUser } from '../../utils/roleDisplay';
import { asyncHandler } from '../../utils/async-handler';
import { sendPasswordResetEmail, sendPartnerRequestEmail, sendPartnerApprovedEmail, sendPartnerRejectedEmail } from '../../services/mailer';

const JWT_EXPIRY = '7d';

function signToken(userId: string) {
  return jwt.sign({ userId }, config.jwt.secret, { expiresIn: JWT_EXPIRY });
}

const DEFAULT_MILESTONES = [
  { name: 'New',             order: 1,  color: '#6366f1' },
  { name: 'First Call',      order: 2,  color: '#06b6d4' },
  { name: 'Demo Scheduled',  order: 3,  color: '#8b5cf6' },
  { name: 'Demo Completed',  order: 4,  color: '#f59e0b' },
  { name: 'Demo Postponed',  order: 5,  color: '#f97316' },
  { name: 'Proposal Shared', order: 6,  color: '#3b82f6' },
  { name: 'PS & Dropped',    order: 7,  color: '#94a3b8' },
  { name: 'Negotiation',     order: 8,  color: '#ec4899' },
  { name: 'Deal Closed',     order: 9,  color: '#10b981' },
  { name: 'Not Interested',  order: 10, color: '#ef4444' },
];

const DEFAULT_DISPOSITIONS = [
  { milestone: 'New',             name: 'Not Contacted',      type: 'neutral',  isDefault: true  },
  { milestone: 'First Call',      name: 'Call Connected',     type: 'positive', isDefault: true  },
  { milestone: 'First Call',      name: 'Call Not Picked',    type: 'neutral',  isDefault: false },
  { milestone: 'First Call',      name: 'Callback Requested', type: 'positive', isDefault: false },
  { milestone: 'Demo Scheduled',  name: 'Meeting Confirmed',  type: 'positive', isDefault: true  },
  { milestone: 'Demo Scheduled',  name: 'No-Show',            type: 'negative', isDefault: false },
  { milestone: 'Demo Postponed',  name: 'Follow Up',          type: 'neutral',  isDefault: true  },
  { milestone: 'Demo Completed',  name: 'Interested',         type: 'positive', isDefault: true  },
  { milestone: 'Demo Completed',  name: 'Not a Fit',          type: 'negative', isDefault: false },
  { milestone: 'Proposal Shared', name: 'Proposal Sent',      type: 'positive', isDefault: true  },
  { milestone: 'Proposal Shared', name: 'Revision Requested', type: 'neutral',  isDefault: false },
  { milestone: 'Negotiation',     name: 'Price Discussion',   type: 'neutral',  isDefault: true  },
  { milestone: 'Negotiation',     name: 'Contract Review',    type: 'positive', isDefault: false },
  { milestone: 'Deal Closed',     name: 'Payment Received',   type: 'positive', isDefault: true  },
  { milestone: 'Not Interested',  name: 'Chose Competitor',   type: 'negative', isDefault: true  },
  { milestone: 'Not Interested',  name: 'Budget Constraint',  type: 'negative', isDefault: false },
  { milestone: 'Not Interested',  name: 'Ghosted',            type: 'negative', isDefault: false },
];

const DEFAULT_SETTINGS = [
  { key: 'forceDisposition',             value: true  },
  { key: 'blockStageSkipping',           value: false },
  { key: 'autoAdvanceOnCompletion',      value: false },
  { key: 'lockHistoricalData',           value: true  },
  { key: 'multipleDispositionsPerStage', value: false },
  { key: 'emailAlertOnStageChange',      value: true  },
  { key: 'autoLeadScoring',             value: true  },
  { key: 'callTranscription',           value: true  },
  { key: 'sentimentAnalysis',           value: true  },
  { key: 'aiDispositionSuggest',        value: true  },
  { key: 'followUpReminders',           value: true  },
  { key: 'dealRiskAlerts',              value: true  },
  { key: 'invoiceDueAlerts',            value: true  },
  { key: 'renewalAlerts',               value: false },
];

// GET /api/v1/auth/setup-status
export const setupStatus = asyncHandler(async (_req: Request, res: Response) => {
  const count = await prisma.user.count({ where: { role: 'SUPER_ADMIN' } });
  return res.json({ setupRequired: count === 0 });
});

// POST /api/v1/auth/signup
export const signup = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, companyName } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'name, email and password are required' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  // Only allow signup if no SUPER_ADMIN exists yet
  const existing = await prisma.user.count({ where: { role: 'SUPER_ADMIN' } });
  if (existing > 0) {
    return res.status(403).json({ error: 'Setup already complete. Please sign in.' });
  }

  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail) {
    return res.status(409).json({ error: 'An account with this email already exists' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const avatar = name.split(' ').map((n: string) => n[0]).join('').toUpperCase();

  const user = await prisma.user.create({
    data: { name, email, passwordHash, role: 'SUPER_ADMIN', avatar, isActive: true },
    include: { team: true },
  });

  // Seed default milestones + dispositions + settings in parallel
  const milestoneRecords: Record<string, any> = {};
  for (const m of DEFAULT_MILESTONES) {
    const record = await prisma.milestone.upsert({
      where: { name: m.name },
      update: {},
      create: m,
    });
    milestoneRecords[m.name] = record;
  }

  for (const d of DEFAULT_DISPOSITIONS) {
    const milestoneId = milestoneRecords[d.milestone]?.id;
    if (!milestoneId) continue;
    const exists = await prisma.disposition.findFirst({ where: { milestoneId, name: d.name } });
    if (!exists) {
      await prisma.disposition.create({
        data: { milestoneId, name: d.name, type: d.type as any, isDefault: d.isDefault, isActive: true },
      });
    }
  }

  for (const s of DEFAULT_SETTINGS) {
    await prisma.systemSetting.upsert({
      where: { key: s.key },
      update: {},
      create: { key: s.key, value: s.value },
    });
  }

  const token = signToken(user.id);
  return res.status(201).json({ token, user: formatUser(user) });
});


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
  if (user.isPending) return res.status(403).json({ error: 'Your account is pending approval. Please wait for the admin to approve your request.' });

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

// POST /api/v1/auth/forgot-password
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const user = await prisma.user.findUnique({ where: { email } });
  // Always return success to prevent email enumeration
  if (!user || !user.isActive) return res.json({ message: 'If that email exists, a reset link has been sent.' });

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordResetToken: token, passwordResetExpiresAt: expiresAt },
  });

  await sendPasswordResetEmail(user.email, user.name, token);

  return res.json({ message: 'If that email exists, a reset link has been sent.' });
});

// POST /api/v1/auth/reset-password
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ error: 'Token and password are required' });
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });

  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken: token,
      passwordResetExpiresAt: { gt: new Date() },
    },
  });

  if (!user) return res.status(400).json({ error: 'Invalid or expired reset token' });

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, passwordResetToken: null, passwordResetExpiresAt: null },
  });

  return res.json({ message: 'Password reset successfully. You can now log in.' });
});

// POST /api/v1/auth/partner-signup
export const partnerSignup = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, phone, companyName } = req.body;
  if (!name || !email || !companyName) {
    return res.status(400).json({ error: 'name, email and companyName are required' });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: 'An account with this email already exists' });

  const approvalToken = crypto.randomBytes(32).toString('hex');
  const passwordHash = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10);
  const avatar = name.split(' ').map((n: string) => n[0]).join('').toUpperCase();

  await prisma.user.create({
    data: {
      name, email, passwordHash,
      role: 'CHANNEL_PARTNER',
      avatar,
      isActive: false,
      isPending: true,
      companyName,
      ...(phone && { phone }),
      approvalToken,
    },
  });

  // Find super admin to notify
  const admin = await prisma.user.findFirst({ where: { role: 'SUPER_ADMIN' } });
  if (admin) {
    await sendPartnerRequestEmail(admin.email, name, email, companyName, approvalToken);
  }

  return res.status(201).json({ message: 'Request submitted. You will receive an email once approved.' });
});

// GET /api/v1/auth/partner-approve
export const partnerApprove = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.query;
  if (!token) return res.status(400).json({ error: 'Token is required' });

  const user = await prisma.user.findUnique({ where: { approvalToken: token as string } });
  if (!user) return res.status(404).send('<h2>Invalid or already used approval link.</h2>');
  if (!user.isPending) return res.status(400).send('<h2>This request has already been processed.</h2>');

  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      isActive: true,
      isPending: false,
      approvalToken: null,
      passwordResetToken: resetToken,
      passwordResetExpiresAt: resetExpiry,
    },
  });

  await sendPartnerApprovedEmail(user.email, user.name, resetToken);

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

  const user = await prisma.user.findUnique({ where: { approvalToken: token as string } });
  if (!user) return res.status(404).send('<h2>Invalid or already used rejection link.</h2>');
  if (!user.isPending) return res.status(400).send('<h2>This request has already been processed.</h2>');

  await sendPartnerRejectedEmail(user.email, user.name);
  await prisma.user.delete({ where: { id: user.id } });

  return res.send(`
    <html><body style="font-family:Arial;text-align:center;padding:60px;">
      <h2 style="color:#ef4444">&#10007; Rejected</h2>
      <p>${user.name}'s request has been rejected and their account has been removed.</p>
    </body></html>
  `);
});
