import { DispositionType, User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { config } from '../../config';
import { prisma } from '../../prisma';
import {
    sendPartnerApprovedEmail,
    sendPartnerRejectedEmail,
    sendPartnerRequestEmail,
    sendPasswordResetEmail,
} from '../../services/mailer';
import { displayToRole } from '../../utils/roleDisplay';

const JWT_EXPIRY = '7d';

type DefaultMilestone = {
	name: string;
	order: number;
	color: string;
};

type DefaultDisposition = {
	milestone: string;
	name: string;
	type: DispositionType;
	isDefault: boolean;
};

type DefaultSetting = {
	key: string;
	value: boolean;
};

const DEFAULT_MILESTONES: DefaultMilestone[] = [
	{ name: 'New', order: 1, color: '#6366f1' },
	{ name: 'First Call', order: 2, color: '#06b6d4' },
	{ name: 'Demo Scheduled', order: 3, color: '#8b5cf6' },
	{ name: 'Demo Completed', order: 4, color: '#f59e0b' },
	{ name: 'Demo Postponed', order: 5, color: '#f97316' },
	{ name: 'Proposal Shared', order: 6, color: '#3b82f6' },
	{ name: 'PS & Dropped', order: 7, color: '#94a3b8' },
	{ name: 'Negotiation', order: 8, color: '#ec4899' },
	{ name: 'Deal Closed', order: 9, color: '#10b981' },
	{ name: 'Not Interested', order: 10, color: '#ef4444' },
];

const DEFAULT_DISPOSITIONS: DefaultDisposition[] = [
	{ milestone: 'New', name: 'Not Contacted', type: 'neutral', isDefault: true },
	{ milestone: 'First Call', name: 'Call Connected', type: 'positive', isDefault: true },
	{ milestone: 'First Call', name: 'Call Not Picked', type: 'neutral', isDefault: false },
	{ milestone: 'First Call', name: 'Callback Requested', type: 'positive', isDefault: false },
	{ milestone: 'Demo Scheduled', name: 'Meeting Confirmed', type: 'positive', isDefault: true },
	{ milestone: 'Demo Scheduled', name: 'No-Show', type: 'negative', isDefault: false },
	{ milestone: 'Demo Completed', name: 'Interested', type: 'positive', isDefault: true },
	{ milestone: 'Demo Completed', name: 'Not a Fit', type: 'negative', isDefault: false },
	{ milestone: 'Proposal Shared', name: 'Proposal Sent', type: 'positive', isDefault: true },
	{ milestone: 'Proposal Shared', name: 'Revision Requested', type: 'neutral', isDefault: false },
	{ milestone: 'Negotiation', name: 'Price Discussion', type: 'neutral', isDefault: true },
	{ milestone: 'Negotiation', name: 'Contract Review', type: 'positive', isDefault: false },
	{ milestone: 'Deal Closed', name: 'Payment Received', type: 'positive', isDefault: true },
	{ milestone: 'Not Interested', name: 'Chose Competitor', type: 'negative', isDefault: true },
	{ milestone: 'Not Interested', name: 'Budget Constraint', type: 'negative', isDefault: false },
	{ milestone: 'Not Interested', name: 'Ghosted', type: 'negative', isDefault: false },
];

const DEFAULT_SETTINGS: DefaultSetting[] = [
	{ key: 'forceDisposition', value: true },
	{ key: 'blockStageSkipping', value: false },
	{ key: 'autoAdvanceOnCompletion', value: false },
	{ key: 'lockHistoricalData', value: true },
	{ key: 'multipleDispositionsPerStage', value: false },
	{ key: 'emailAlertOnStageChange', value: true },
	{ key: 'autoLeadScoring', value: true },
	{ key: 'callTranscription', value: true },
	{ key: 'sentimentAnalysis', value: true },
	{ key: 'aiDispositionSuggest', value: true },
	{ key: 'followUpReminders', value: true },
	{ key: 'dealRiskAlerts', value: true },
	{ key: 'invoiceDueAlerts', value: true },
	{ key: 'renewalAlerts', value: false },
	{ key: 'autoTagDisposition', value: false },
	{ key: 'sentimentBasedRouting', value: false },
	{ key: 'forceManualOverride', value: false },
];

function makeAvatar(name: string): string {
	return name
		.split(' ')
		.map((part) => part[0])
		.join('')
		.toUpperCase();
}

export function signToken(userId: string): string {
	return jwt.sign({ userId }, config.jwt.secret, { expiresIn: JWT_EXPIRY });
}

export async function isSetupRequired(): Promise<boolean> {
	const count = await prisma.user.count({ where: { role: 'SUPER_ADMIN' } });
	return count === 0;
}

export async function signupSuperAdmin(input: {
	name: string;
	email: string;
	password: string;
}): Promise<{ token: string; user: User & { team: { id: string; name: string; createdAt: Date } | null } }> {
	const existing = await prisma.user.count({ where: { role: 'SUPER_ADMIN' } });
	if (existing > 0) {
		throw new Error('SETUP_COMPLETE');
	}

	const existingEmail = await prisma.user.findUnique({ where: { email: input.email } });
	if (existingEmail) {
		throw new Error('EMAIL_EXISTS');
	}

	const passwordHash = await bcrypt.hash(input.password, 10);
	const avatar = makeAvatar(input.name);

	const user = await prisma.user.create({
		data: {
			name: input.name,
			email: input.email,
			passwordHash,
			role: 'SUPER_ADMIN',
			avatar,
			isActive: true,
		},
		include: { team: true },
	});

	const milestoneByName: Record<string, string> = {};
	for (const milestone of DEFAULT_MILESTONES) {
		const created = await prisma.milestone.upsert({
			where: { name: milestone.name },
			update: {},
			create: milestone,
		});
		milestoneByName[milestone.name] = created.id;
	}

	for (const disposition of DEFAULT_DISPOSITIONS) {
		const milestoneId = milestoneByName[disposition.milestone];
		if (!milestoneId) {
			continue;
		}

		const exists = await prisma.disposition.findFirst({
			where: { milestoneId, name: disposition.name },
		});
		if (!exists) {
			await prisma.disposition.create({
				data: {
					milestoneId,
					name: disposition.name,
					type: disposition.type,
					isDefault: disposition.isDefault,
					isActive: true,
				},
			});
		}
	}

	for (const setting of DEFAULT_SETTINGS) {
		await prisma.systemSetting.upsert({
			where: { key: setting.key },
			update: {},
			create: { key: setting.key, value: setting.value },
		});
	}

	return { token: signToken(user.id), user };
}

export async function loginForDemo(displayRole: string) {
	const prismaRole = displayToRole(displayRole);

	const user = await prisma.user.findFirst({
		where: {
			role: prismaRole,
			...(prismaRole !== 'SUPER_ADMIN' && { isActive: true }),
		},
		include: { team: true },
	});

	if (!user) {
		return null;
	}

	await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
	return { token: signToken(user.id), user };
}

export async function loginWithPassword(email: string, password: string) {
	const user = await prisma.user.findUnique({ where: { email }, include: { team: true } });
	if (!user || !user.isActive) {
		return { kind: 'invalid' as const };
	}

	if (user.isPending) {
		return { kind: 'pending' as const };
	}

	const valid = await bcrypt.compare(password, user.passwordHash);
	if (!valid) {
		return { kind: 'invalid' as const };
	}

	await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
	return { kind: 'ok' as const, token: signToken(user.id), user };
}

export async function getCurrentUser(token: string) {
	const payload = jwt.verify(token, config.jwt.secret) as { userId: string };
	return prisma.user.findUnique({ where: { id: payload.userId }, include: { team: true } });
}

export async function requestPasswordReset(email: string): Promise<void> {
	const user = await prisma.user.findUnique({ where: { email } });
	if (!user || !user.isActive) {
		return;
	}

	const token = crypto.randomBytes(32).toString('hex');
	const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

	await prisma.user.update({
		where: { id: user.id },
		data: { passwordResetToken: token, passwordResetExpiresAt: expiresAt },
	});

	await sendPasswordResetEmail(user.email, user.name, token);
}

export async function updatePasswordFromResetToken(token: string, password: string): Promise<boolean> {
	const user = await prisma.user.findFirst({
		where: {
			passwordResetToken: token,
			passwordResetExpiresAt: { gt: new Date() },
		},
	});

	if (!user) {
		return false;
	}

	const passwordHash = await bcrypt.hash(password, 10);
	await prisma.user.update({
		where: { id: user.id },
		data: { passwordHash, passwordResetToken: null, passwordResetExpiresAt: null },
	});

	return true;
}

export async function signupPartner(input: {
	name: string;
	email: string;
	companyName: string;
	phone?: string;
}): Promise<'ok' | 'email_exists'> {
	const existing = await prisma.user.findUnique({ where: { email: input.email } });
	if (existing) {
		return 'email_exists';
	}

	const approvalToken = crypto.randomBytes(32).toString('hex');
	const passwordHash = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10);

	await prisma.user.create({
		data: {
			name: input.name,
			email: input.email,
			passwordHash,
			role: 'CHANNEL_PARTNER',
			avatar: makeAvatar(input.name),
			isActive: false,
			isPending: true,
			companyName: input.companyName,
			...(input.phone && { phone: input.phone }),
			approvalToken,
		},
	});

	const admin = await prisma.user.findFirst({ where: { role: 'SUPER_ADMIN' } });
	if (admin) {
		await sendPartnerRequestEmail(
			admin.email,
			input.name,
			input.email,
			input.companyName,
			approvalToken,
		);
	}

	return 'ok';
}

export async function approvePartner(token: string): Promise<User | null | 'already_processed'> {
	const user = await prisma.user.findUnique({ where: { approvalToken: token } });
	if (!user) {
		return null;
	}
	if (!user.isPending) {
		return 'already_processed';
	}

	const resetToken = crypto.randomBytes(32).toString('hex');
	const resetExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

	const updated = await prisma.user.update({
		where: { id: user.id },
		data: {
			isActive: true,
			isPending: false,
			approvalToken: null,
			passwordResetToken: resetToken,
			passwordResetExpiresAt: resetExpiry,
		},
	});

	await sendPartnerApprovedEmail(updated.email, updated.name, resetToken);
	return updated;
}

export async function rejectPartner(token: string): Promise<User | null | 'already_processed'> {
	const user = await prisma.user.findUnique({ where: { approvalToken: token } });
	if (!user) {
		return null;
	}
	if (!user.isPending) {
		return 'already_processed';
	}

	await sendPartnerRejectedEmail(user.email, user.name);
	await prisma.user.delete({ where: { id: user.id } });
	return user;
}
