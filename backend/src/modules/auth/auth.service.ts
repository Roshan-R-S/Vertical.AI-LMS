import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../prisma';
import { sendApprovalEmail } from '../../services/mailer';
import { Role } from '@prisma/client';

const JWT_SECRET = process.env.JWT_ACCESS_SECRET || 'fallback-secret';

export class AuthService {
  static async register(email: string, passwordHash: string, name: string, role: Role) {
    // 1. Check if user or pending request already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new Error('Email already registered.');

    const existingRequest = await prisma.registrationRequest.findUnique({ where: { email } });
    if (existingRequest) throw new Error('A registration request is already pending for this email.');

    // 2. Generate a unique approval token
    const approvalToken = jwt.sign({ email, type: 'APPROVAL' }, JWT_SECRET, { expiresIn: '48h' });

    // 3. Resolve Team Lead to notify
    const teamLead = await this.findTeamLeadToNotify();
    
    // 4. Save the request
    const request = await prisma.registrationRequest.create({
      data: {
        email,
        passwordHash,
        name,
        role,
        approvalToken,
        teamLeadEmail: teamLead.email,
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48h
      },
    });

    // 5. Send Email
    await sendApprovalEmail(teamLead.email, name, role, approvalToken);

    return { message: "Your request is pending Team Lead approval. You will be notified once reviewed." };
  }

  static async approve(token: string) {
    // 1. Verify token
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
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

    // 3. Create User
    const user = await prisma.user.create({
      data: {
        email: request.email,
        passwordHash: request.passwordHash,
        name: request.name,
        role: request.role,
        isActive: true, // Approved!
      },
    });

    // 4. Update request status
    await prisma.registrationRequest.update({
      where: { id: request.id },
      data: { status: 'APPROVED' },
    });

    return user;
  }

  static async deny(token: string) {
    // 1. Verify token
    try {
      jwt.verify(token, JWT_SECRET);
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

    return { message: 'Registration request denied.' };
  }

  static async login(email: string, passwordRaw: string) {
    // 1. Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('Invalid email or password.');

    // 2. Check isActive (must be approved by Team Lead)
    if (!user.isActive) {
      throw new Error('Your account is pending approval or has been denied.');
    }

    // 3. Verify password
    const isMatch = await bcrypt.compare(passwordRaw, user.passwordHash);
    if (!isMatch) throw new Error('Invalid email or password.');

    // 4. Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN as any) || '15m' }
    );

    return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
  }

  static async findUserById(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, avatar: true },
    });
  }

  // --- Helpers ---
  private static async findTeamLeadToNotify() {
    // Look for TEAM_LEAD, then SALES_ADMIN, then SUPER_ADMIN
    let lead = await prisma.user.findFirst({ where: { role: 'TEAM_LEAD', isActive: true } });
    if (!lead) lead = await prisma.user.findFirst({ where: { role: 'SALES_ADMIN', isActive: true } });
    if (!lead) lead = await prisma.user.findFirst({ where: { role: 'SUPER_ADMIN', isActive: true } });

    if (!lead) {
      // Fallback if system is totally empty (e.g., first user)
      return { email: process.env.SYSTEM_ADMIN_EMAIL || 'admin@vertical.ai' };
    }
    return lead;
  }
}
