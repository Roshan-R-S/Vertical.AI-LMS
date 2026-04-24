import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../prisma';
import { sendApprovalEmail, sendPasswordResetEmail, sendChannelPartnerApprovedEmail, sendChannelPartnerRequestEmail } from '../../services/mailer';
import crypto from 'crypto';
import { Role } from '@prisma/client';
import { logAudit } from '../audit-logs/audit-logs.service';

import { config } from '../../config';

export class AuthService {
  static async register(
    email: string, 
    passwordHash: string, 
    name: string, 
    role: Role, 
    extra?: { firstName?: string; lastName?: string; username?: string; phone?: string; profession?: string }
  ) {
    // 1. Check if user or pending request already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new Error('Email already registered.');

    const existingRequest = await prisma.registrationRequest.findUnique({ where: { email } });
    if (existingRequest) throw new Error('A registration request is already pending for this email.');

    // 2. Generate a unique approval token
    const approvalToken = jwt.sign({ email, type: 'APPROVAL' }, config.jwt.secret, { expiresIn: '48h' });

    // 3. Resolve Admin to notify
    // Channel Partner requests MUST go to SALES_HEAD as per user feedback
    let adminToNotify: { email: string };
    if (role === 'CHANNEL_PARTNER') {
      adminToNotify = await this.findSalesHeadToNotify();
    } else {
      adminToNotify = await this.findTeamLeadToNotify();
    }
    
    // 4. Save the request
    const request = await prisma.registrationRequest.create({
      data: {
        email,
        passwordHash,
        name,
        role,
        approvalToken,
        teamLeadEmail: adminToNotify.email,
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48h
        firstName: extra?.firstName,
        lastName: extra?.lastName,
        username: extra?.username,
        phone: extra?.phone,
        profession: extra?.profession,
      },
    });

    // 5. Send Email
    if (role === 'CHANNEL_PARTNER') {
      await sendChannelPartnerRequestEmail(adminToNotify.email, name, email, approvalToken);
    } else {
      await sendApprovalEmail(adminToNotify.email, name, role, approvalToken);
    }

    return { message: role === 'CHANNEL_PARTNER' 
      ? "Your request as a Channel Partner is pending Sales Head approval." 
      : "Your request is pending Team Lead approval. You will be notified once reviewed." };
  }

  static async approve(token: string) {
    // 1. Verify token
    try {
      jwt.verify(token, config.jwt.secret);
    } catch (err) {
      throw new Error('Approval link has expired or is invalid.');
    }

    // 2. Find request
    const request = await prisma.registrationRequest.findUnique({
      where: { approvalToken: token },
    });

    if (!request || request.status !== 'PENDING') {
      throw new Error('Request already processed or not found.');
    }

    // 3. Special handling for Channel Partner
    let passwordHash = request.passwordHash;
    let mustResetPassword = false;

    if (request.role === 'CHANNEL_PARTNER') {
      // Create with dummy password "LMS-TheVerticalAI"
      passwordHash = await bcrypt.hash('LMS-TheVerticalAI', 10);
      mustResetPassword = true;
    }

    // 4. Create User
    const user = await prisma.user.create({
      data: {
        email: request.email,
        passwordHash: passwordHash,
        name: request.name,
        role: request.role,
        isActive: true, // Approved!
        mustResetPassword: mustResetPassword,
        username: request.username,
        phone: request.phone,
        profession: request.profession,
      },
    });

    // 5. Update request status
    await prisma.registrationRequest.update({
      where: { id: request.id },
      data: { status: 'APPROVED' },
    });

    // 6. Notify Partner if applicable
    if (request.role === 'CHANNEL_PARTNER') {
      await sendChannelPartnerApprovedEmail(user.email, user.name, user.username || user.email);
    }

    await logAudit(user.id, 'USER_REGISTER_APPROVED', 'USER', user.id, `Registration approved for ${user.email}`);

    return user;
  }

  static async deny(token: string) {
    // 1. Verify token
    try {
      jwt.verify(token, config.jwt.secret);
    } catch (err) {
      throw new Error('Link has expired or is invalid.');
    }

    // 2. Update request status
    const request = await prisma.registrationRequest.findUnique({
      where: { approvalToken: token },
    });

    if (!request || request.status !== 'PENDING') {
      throw new Error('Request already processed or not found.');
    }

    await prisma.registrationRequest.update({
      where: { id: request.id },
      data: { status: 'DENIED' },
    });

    await logAudit(null as any, 'USER_REGISTER_DENIED', 'USER', undefined, `Registration denied for ${request.email}`);

    return { message: 'Registration request denied.' };
  }

  static async login(identifier: string, passwordRaw: string) {
    // 1. Find user by email or username
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { username: identifier }
        ]
      }
    });

    if (!user) throw new Error('Invalid email or password.');

    // 2. Check isActive (must be approved by Team Lead/Admin)
    if (!user.isActive) {
      throw new Error('Your account is pending approval or has been denied.');
    }

    // 3. Verify password
    const isMatch = await bcrypt.compare(passwordRaw, user.passwordHash);
    if (!isMatch) throw new Error('Invalid email or password.');

    // 4. Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn as any }
    );

    await logAudit(user.id, 'USER_LOGIN', 'USER', user.id, `User ${user.email} logged in`);

    return { 
      token, 
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        mustResetPassword: user.mustResetPassword,
        notifyEmail: user.notifyEmail,
        notifyPush: user.notifyPush,
        notifyTasks: user.notifyTasks,
        notifyAssignments: user.notifyAssignments
      } 
    };
  }

  static async requestPasswordReset(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
      return { message: 'If that email exists, a password reset link has been sent.' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { email },
      data: { resetToken: resetTokenHash, resetTokenExpiry },
    });

    await sendPasswordResetEmail(email, user.name, resetToken);
    return { message: 'If that email exists, a password reset link has been sent.' };
  }

  static async resetPassword(token: string, passwordRaw: string) {
    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await prisma.user.findFirst({
      where: {
        resetToken: resetTokenHash,
        resetTokenExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      throw new Error('Invalid or expired password reset token.');
    }

    const passwordHash = await bcrypt.hash(passwordRaw, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null,
        mustResetPassword: false, // Clear flag if it was set
      },
    });

    return { message: 'Password has been successfully reset.' };
  }

  static async changePassword(userId: string, currentPasswordRaw: string, newPasswordRaw: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found.');

    const isMatch = await bcrypt.compare(currentPasswordRaw, user.passwordHash);
    if (!isMatch) throw new Error('Current password is incorrect.');

    const passwordHash = await bcrypt.hash(newPasswordRaw, 10);

    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash,
        mustResetPassword: false,
      },
    });

    return { message: 'Password changed successfully.' };
  }

  static async findUserById(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, avatar: true, notifyEmail: true, notifyPush: true, notifyTasks: true, notifyAssignments: true },
    });
  }

  // --- Helpers ---
  private static async findSalesHeadToNotify() {
    let lead = await prisma.user.findFirst({ where: { role: 'SALES_HEAD', isActive: true } });
    if (!lead) lead = await prisma.user.findFirst({ where: { role: 'SUPER_ADMIN', isActive: true } });

    if (!lead) {
      return { email: process.env.SYSTEM_ADMIN_EMAIL || 'admin@vertical.ai' };
    }
    return lead;
  }

  private static async findTeamLeadToNotify() {
    // Look for TEAM_LEAD, then SALES_HEAD, then SUPER_ADMIN
    let lead = await prisma.user.findFirst({ where: { role: 'TEAM_LEAD', isActive: true } });
    if (!lead) lead = await prisma.user.findFirst({ where: { role: 'SALES_HEAD', isActive: true } });
    if (!lead) lead = await prisma.user.findFirst({ where: { role: 'SUPER_ADMIN', isActive: true } });

    if (!lead) {
      // Fallback if system is totally empty (e.g., first user)
      return { email: process.env.SYSTEM_ADMIN_EMAIL || 'admin@vertical.ai' };
    }
    return lead;
  }
}
