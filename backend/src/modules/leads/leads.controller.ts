import { LeadPriority, LeadStatus, Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import { prisma } from '../../prisma';
import { asyncHandler } from '../../utils/async-handler';
import { getLeadScopeFilter } from '../../utils/scoping';
import {
    ALLOWED_TRANSITIONS,
    FOLLOWUP_TRIGGER_STAGES,
    NOTIFY_STAGES,
    getNotificationMessage,
    isTransitionAllowed,
} from './leads.constants';

// Shape a lead into the frontend contract
function formatLead(lead: any) {
  return {
    id: lead.id,
    companyName: lead.companyName,
    contactName: lead.contactName,
    email: lead.email,
    phone: lead.phone,
    source: lead.source,
    industry: lead.industry,
    tags: lead.tags,
    milestone: lead.milestone?.name ?? null,
    milestoneId: lead.milestoneId,
    milestoneColor: lead.milestone?.color ?? null,
    disposition: lead.disposition?.name ?? null,
    dispositionId: lead.dispositionId,
    status: lead.status,
    priority: lead.priority,
    score: lead.score,
    value: lead.value,
    probability: lead.probability,
    expectedClose: lead.expectedClose ? new Date(lead.expectedClose).toISOString().split('T')[0] : null,
    notes: lead.notes,
    assignedBDE: lead.assignedTo?.name ?? null,
    assignedBDEId: lead.assignedToId,
    assignedToId: lead.assignedToId,
    createdById: lead.createdById,
    assignedBDEAvatar: lead.assignedTo?.avatar ?? null,
    assignedTL: lead.assignedTo?.team ? `${lead.assignedTo.team.name}` : null,
    teamName: lead.assignedTo?.team?.name ?? null,
    nextFollowUp: lead.nextFollowUp,
    lastFollowUp: lead.lastFollowUp,
    createdAt: lead.createdAt ? new Date(lead.createdAt).toISOString().split('T')[0] : null,
    updatedAt: lead.updatedAt,
    _count: lead._count,
  };
}

const LEAD_INCLUDE = {
  milestone: true,
  disposition: true,
  assignedTo: { include: { team: true } },
  _count: { select: { interactions: true, tasks: true, attachments: true } },
};

function normalizePhone(value?: string | null) {
  return (value ?? '').replace(/\D/g, '');
}

function normalizeEmail(value?: string | null) {
  return (value ?? '').trim().toLowerCase();
}

async function hasDuplicateLead(phone?: string | null, email?: string | null) {
  const normalizedPhone = normalizePhone(phone);
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedPhone && !normalizedEmail) return false;

  if (normalizedPhone && normalizedEmail) {
    const matches = await prisma.$queryRaw<{ id: string }[]>`
      SELECT "id"
      FROM "leads"
      WHERE "deletedAt" IS NULL
        AND (
          regexp_replace(COALESCE("phone", ''), '[^0-9]', '', 'g') = ${normalizedPhone}
          OR lower(trim(COALESCE("email", ''))) = ${normalizedEmail}
        )
      LIMIT 1
    `;
    return matches.length > 0;
  }

  if (normalizedPhone) {
    const matches = await prisma.$queryRaw<{ id: string }[]>`
      SELECT "id"
      FROM "leads"
      WHERE "deletedAt" IS NULL
        AND regexp_replace(COALESCE("phone", ''), '[^0-9]', '', 'g') = ${normalizedPhone}
      LIMIT 1
    `;
    return matches.length > 0;
  }

  const matches = await prisma.$queryRaw<{ id: string }[]>`
    SELECT "id"
    FROM "leads"
    WHERE "deletedAt" IS NULL
      AND lower(trim(COALESCE("email", ''))) = ${normalizedEmail}
    LIMIT 1
  `;
  return matches.length > 0;
}

// POST /api/v1/leads/check-duplicate
export const checkLeadDuplicate = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as Record<string, any>;
  const exists = await hasDuplicateLead(body.phone, body.email);
  return res.json({ exists });
});

// GET /api/v1/leads
export const getLeads = asyncHandler(async (req: Request, res: Response) => {
  const status = req.query.status as string | undefined;
  const milestoneId = req.query.milestoneId as string | undefined;
  const assignedToId = req.query.assignedToId as string | undefined;
  const search = req.query.search as string | undefined;
  const source = req.query.source as string | undefined;
  const priority = req.query.priority as string | undefined;

  const leads = await prisma.lead.findMany({
    where: {
      ...getLeadScopeFilter((req as any).user),
      ...(status && { status: status as LeadStatus }),
      ...(milestoneId && { milestoneId }),
      ...(assignedToId && { assignedToId }),
      ...(source && { source }),
      ...(priority && { priority: priority as LeadPriority }),
      ...(search && {
        OR: [
          { companyName: { contains: search, mode: 'insensitive' } },
          { contactName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
        ],
      }),
    },
    include: LEAD_INCLUDE,
    orderBy: { createdAt: 'desc' },
  });

  return res.json(leads.map(formatLead));
});

// GET /api/v1/leads/:id
export const getLeadById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = (req as any).user;
  const lead = await prisma.lead.findFirst({
    where: { 
      id: id as string,
      ...getLeadScopeFilter(user)
    },
    include: {
      ...LEAD_INCLUDE,
      interactions: {
        include: { performedBy: true },
        orderBy: { createdAt: 'desc' },
      },
      tasks: {
        include: { assignedTo: true, createdBy: true },
        orderBy: { dueDate: 'asc' },
      },
    },
  });
  if (!lead) return res.status(404).json({ error: 'Lead not found' });
  return res.json(formatLead(lead));
});

// POST /api/v1/leads
export const createLead = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as Record<string, any>;
  const companyName = body.companyName as string | undefined;
  const contactName = body.contactName as string | undefined;
  const email = body.email as string | undefined;
  const phone = body.phone as string | undefined;
  const source = body.source as string | undefined;
  const industry = body.industry as string | undefined;
  const tags = body.tags as string[] | undefined;
  const milestoneId = body.milestoneId as string | undefined;
  const dispositionId = body.dispositionId as string | undefined;
  const priority = body.priority as string | undefined;
  const value = body.value as number | undefined;
  const probability = body.probability as number | undefined;
  const expectedClose = body.expectedClose as string | undefined;
  const notes = body.notes as string | undefined;
  const assignedToId = body.assignedToId as string | undefined;
  const score = body.score as number | undefined;

  if (!companyName || !contactName || !phone) {
    return res.status(400).json({ error: 'companyName, contactName, phone are required' });
  }

  if (await hasDuplicateLead(phone, email)) {
    return res.status(409).json({ error: 'Lead already exists with this phone or email.' });
  }

  const user = (req as any).user;
  // CP can only assign leads to themselves
  const finalAssignedToId = user.role === 'CHANNEL_PARTNER' ? user.id : (assignedToId ?? user.id);
  if (!finalAssignedToId) {
    return res.status(400).json({ error: 'assignedToId is required' });
  }

  const lead = await prisma.lead.create({
    data: {
      companyName, contactName, email, phone, source, industry,
      tags: tags ?? [],
      milestoneId, dispositionId,
      priority: (priority ?? 'Medium') as LeadPriority,
      value: value ?? 0,
      probability: probability ?? 0,
      expectedClose: expectedClose ? new Date(expectedClose) : undefined,
      notes, score: score ?? 0,
      assignedToId: finalAssignedToId,
      createdById: finalAssignedToId,
      status: 'active',
    },
    include: LEAD_INCLUDE,
  });
  return res.status(201).json(formatLead(lead));
});

// PATCH /api/v1/leads/:id
export const updateLead = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const body = req.body as Record<string, any>;
  // ... (keeping variables same)
  const companyName = body.companyName as string | undefined;
  const contactName = body.contactName as string | undefined;
  const email = body.email as string | undefined;
  const phone = body.phone as string | undefined;
  const source = body.source as string | undefined;
  const industry = body.industry as string | undefined;
  const tags = body.tags as string[] | undefined;
  const milestoneId = body.milestoneId as string | undefined;
  const dispositionId = body.dispositionId as string | undefined;
  const status = body.status as string | undefined;
  const priority = body.priority as string | undefined;
  const value = body.value as number | undefined;
  const probability = body.probability as number | undefined;
  const expectedClose = body.expectedClose as string | undefined;
  const notes = body.notes as string | undefined;
  const assignedToId = body.assignedToId as string | undefined;
  const score = body.score as number | undefined;
  const nextFollowUp = body.nextFollowUp as string | undefined;

  const user = (req as any).user;
  const existing = await prisma.lead.findFirst({
    where: { id: id as string, ...getLeadScopeFilter(user) },
    include: { milestone: true, disposition: true },
  });
  if (!existing) return res.status(404).json({ error: 'Lead not found or access denied' });
  const oldMilestoneId = existing.milestoneId;

  // ─── Workflow Enforcement ───────────────────────────────────────
  const settingsRecords = await prisma.systemSetting.findMany();
  const settings = settingsRecords.reduce((acc: any, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {});

  // 1. Validate Stage Transition — not enforced for Super Admin
  if (settings.blockStageSkipping && milestoneId && milestoneId !== oldMilestoneId && user.role !== 'SUPER_ADMIN') {
    const targetMilestone = await prisma.milestone.findUnique({ where: { id: milestoneId } });
    
    if (targetMilestone && !isTransitionAllowed(oldMilestoneId, milestoneId, existing.milestone?.name, targetMilestone.name)) {
      return res.status(400).json({
        error: `Workflow Error: Cannot move from "${existing.milestone?.name || 'New'}" to "${targetMilestone.name}". This transition is not allowed in the pipeline.`,
        allowedTransitions: ALLOWED_TRANSITIONS[existing.milestone?.name || ''] || [],
      });
    }
  }

  // 2. Force Disposition Selection — not enforced for Super Admin
  let finalDispositionId = dispositionId;
  if (settings.forceDisposition && milestoneId && milestoneId !== oldMilestoneId && user.role !== 'SUPER_ADMIN') {
    if (!dispositionId || dispositionId === existing.dispositionId) {
      // Find a default disposition for the new milestone
      const defaultDisp = await prisma.disposition.findFirst({
        where: { milestoneId, isDefault: true, isActive: true }
      });
      if (defaultDisp) {
        finalDispositionId = defaultDisp.id;
      }
      // If no default exists, allow the move without a disposition (don't block)
    }
  }
  // ──────────────────────────────────────────────────────────────────

  const lead = await prisma.lead.update({
    where: { id: id as string },
    data: {
      ...(companyName && { companyName }),
      ...(contactName && { contactName }),
      ...(email !== undefined && { email }),
      ...(phone && { phone }),
      ...(source !== undefined && { source }),
      ...(industry !== undefined && { industry }),
      ...(tags !== undefined && { tags }),
      ...(milestoneId !== undefined && { milestoneId }),
      ...(finalDispositionId !== undefined && { dispositionId: finalDispositionId }),
      ...(status && { status: status as LeadStatus }),
      ...(priority && { priority: priority as LeadPriority }),
      ...(value !== undefined && { value }),
      ...(probability !== undefined && { probability }),
      ...(expectedClose !== undefined && { expectedClose: expectedClose ? new Date(expectedClose) : null }),
      ...(notes !== undefined && { notes }),
      ...(assignedToId && { assignedToId }),
      ...(score !== undefined && { score }),
      ...(nextFollowUp !== undefined && { nextFollowUp: nextFollowUp ? new Date(nextFollowUp) : null }),
    },
    include: {
      ...LEAD_INCLUDE,
      milestone: true,
    },
  });

  // ─── Milestone Change Logic ──────────────────────────────────────
  if (milestoneId && milestoneId !== oldMilestoneId && lead.milestone) {
    const newMilestoneName = lead.milestone.name;

    // 1. Send Notifications for key stages
    if (NOTIFY_STAGES.includes(newMilestoneName)) {
      const notifyUserIds = new Set<string>();

      // Always notify the assigned BDE
      notifyUserIds.add(lead.assignedToId);

      // Also notify their Team Lead
      const bde = await prisma.user.findUnique({
        where: { id: lead.assignedToId },
        include: { team: { include: { users: { where: { role: 'TEAM_LEAD' } } } } },
      });
      bde?.team?.users.forEach(tl => notifyUserIds.add(tl.id));

      const { text: notifText, type: notifType } = getNotificationMessage(newMilestoneName, lead.companyName);

      await prisma.notification.createMany({
        data: Array.from(notifyUserIds).map(userId => ({
          userId,
          text: notifText,
          type: notifType as any,
        })),
      });
    }

    // 2. Create Follow-up Task for Demo Postponed
    if (FOLLOWUP_TRIGGER_STAGES.includes(newMilestoneName)) {
      const followUpDateFrom = body.followUpDateFrom ? new Date(body.followUpDateFrom) : new Date(Date.now() + 24 * 60 * 60 * 1000);

      await prisma.task.create({
        data: {
          title: `Follow-up: Reschedule demo for ${lead.companyName}`,
          leadId: lead.id,
          assignedToId: lead.assignedToId,
          createdById: user.id,
          dueDate: followUpDateFrom,
          status: 'pending',
        },
      });

      await prisma.notification.create({
        data: {
          userId: lead.assignedToId,
          text: `📋 Follow-up task created for "${lead.companyName}" — reschedule demo by ${followUpDateFrom.toDateString()}`,
          type: 'warning',
        },
      });
    }
  }
  // ──────────────────────────────────────────────────────────────────

  return res.json(formatLead(lead));
});

// DELETE /api/v1/leads/:id
export const deleteLead = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = (req as any).user;
  await prisma.lead.deleteMany({ 
    where: { 
      id: id as string,
      ...getLeadScopeFilter(user)
    } 
  });
  return res.json({ success: true });
});

// GET /api/v1/leads/:id/interactions
export async function getLeadInteractions(req: Request, res: Response) {
  const { id } = req.params;
  const interactions = await prisma.interaction.findMany({
    where: { leadId: id as string },
    include: { performedBy: true },
    orderBy: { createdAt: 'desc' },
  });
  return res.json(interactions.map(i => ({
    id: i.id, leadId: i.leadId, type: i.type, direction: i.direction,
    subject: i.subject, summary: i.summary, duration: i.duration,
    sentiment: i.sentiment, hasTranscript: i.hasTranscript, hasRecording: i.hasRecording,
    performedById: i.performedById,
    by: (i as any).performedBy?.name ?? null,
    date: i.createdAt.toLocaleString('en-IN'),
    transcript: i.hasTranscript,
    recording: i.hasRecording,
  })));
}

// POST /api/v1/leads/:id/interactions
export async function createLeadInteraction(req: Request, res: Response) {
  const { id } = req.params;
  const body = req.body as Record<string, any>;
  const type = body.type as string | undefined;
  const direction = body.direction as string | undefined;
  const subject = body.subject as string | undefined;
  const summary = body.summary as string | undefined;
  const duration = body.duration as string | undefined;
  const sentiment = body.sentiment as string | undefined;
  const hasTranscript = body.hasTranscript as boolean | undefined;
  const hasRecording = body.hasRecording as boolean | undefined;
  const performedById = body.performedById as string | undefined;

  if (!type || !summary || !performedById) {
    return res.status(400).json({ error: 'type, summary, performedById are required' });
  }

  const interaction = await prisma.interaction.create({
    data: {
      leadId: id as string, type: type as any, direction: direction as any, subject, summary,
      duration, sentiment: (sentiment ?? 'neutral') as any,
      hasTranscript: hasTranscript ?? false,
      hasRecording: hasRecording ?? false,
      performedById,
    },
    include: { performedBy: true },
  });

  await prisma.lead.update({ where: { id: id as string }, data: { lastFollowUp: new Date() } });

  return res.status(201).json({
    id: interaction.id, leadId: interaction.leadId, type: interaction.type,
    direction: interaction.direction, subject: interaction.subject,
    summary: interaction.summary, duration: interaction.duration,
    sentiment: interaction.sentiment,
    hasTranscript: interaction.hasTranscript, hasRecording: interaction.hasRecording,
    by: (interaction as any).performedBy?.name ?? null,
    date: interaction.createdAt.toLocaleString('en-IN'),
  });
}

// GET /api/v1/leads/:id/tasks
export async function getLeadTasks(req: Request, res: Response) {
  const { id } = req.params;
  const tasks = await prisma.task.findMany({
    where: { leadId: id as string },
    include: { assignedTo: true },
    orderBy: { dueDate: 'asc' },
  });
  return res.json(tasks);
}

// POST /api/v1/leads/:id/tasks
export async function createLeadTask(req: Request, res: Response) {
  const { id } = req.params;
  const body = req.body as Record<string, any>;
  const title = body.title as string | undefined;
  const assignedToId = body.assignedToId as string | undefined;
  const dueDate = body.dueDate as string | undefined;
  const createdById = body.createdById as string | undefined;
  if (!title || !assignedToId || !dueDate) {
    return res.status(400).json({ error: 'title, assignedToId, dueDate are required' });
  }
  const task = await prisma.task.create({
    data: {
      title, leadId: id as string, assignedToId,
      createdById: createdById ?? assignedToId,
      dueDate: new Date(dueDate), status: 'pending',
    },
    include: { assignedTo: true },
  });
  return res.status(201).json(task);
}

// POST /api/v1/leads/:id/convert
// POST /api/v1/leads/:id/convert
export const convertLeadToClient = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  const lead = await prisma.lead.findUnique({
    where: { id: id as string },
    include: { milestone: true }
  });

  if (!lead) return res.status(404).json({ error: 'Lead not found' });
  
  const existingClient = await prisma.client.findFirst({
    where: { linkedLeadId: id as string }
  });
  if (existingClient) return res.status(400).json({ error: 'Lead is already converted to a client' });

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the Client
      const client = await tx.client.create({
        data: {
          companyName: lead.companyName,
          contactName: lead.contactName,
          email: lead.email || `${lead.contactName.toLowerCase().replace(/\s/g, '')}@${lead.companyName.toLowerCase().replace(/\s/g, '')}.com`,
          phone: lead.phone,
          industry: lead.industry,
          products: [], 
          orderValue: lead.value,
          contractDuration: '12 months',
          startDate: new Date(),
          renewalDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
          status: 'active',
          linkedLeadId: lead.id,
          accountManagerId: lead.assignedToId,
        }
      });

      // 2. Update Lead Status to won
      await tx.lead.update({
        where: { id: id as string },
        data: { status: 'won' }
      });

      // 3. Migrate Interactions
      await tx.interaction.updateMany({
        where: { leadId: id as string },
        data: { clientId: client.id }
      });

      // 4. Migrate Tasks
      await tx.task.updateMany({
        where: { leadId: id as string },
        data: { clientId: client.id }
      });

      // 5. Migrate Attachments
      await tx.attachment.updateMany({
        where: { leadId: id as string },
        data: { clientId: client.id }
      });

      return client;
    });

    return res.json({ success: true, client: result });
  } catch (err: any) {
    console.error('Conversion failed:', err);
    return res.status(500).json({ error: 'Failed to convert lead: ' + err.message });
  }
});

// POST /api/v1/leads/bulk
export const bulkCreateLeads = asyncHandler(async (req: Request, res: Response) => {
  const leads = req.body as any[];
  const user = (req as any).user;
  
  if (!Array.isArray(leads)) {
    return res.status(400).json({ error: 'Body must be an array of leads' });
  }

  try {
    // Get default milestone if none provided
    const firstMilestone = await prisma.milestone.findFirst({ orderBy: { order: 'asc' } });

    const candidatePhones = Array.from(
      new Set(
        leads
          .map((lead) => normalizePhone(lead.phone))
          .filter((phone) => Boolean(phone)),
      ),
    );
    const candidateEmails = Array.from(
      new Set(
        leads
          .map((lead) => normalizeEmail(lead.email))
          .filter((email) => Boolean(email)),
      ),
    );

    const existingMatches =
      candidatePhones.length || candidateEmails.length
        ? await prisma.$queryRaw<{ phone: string | null; email: string | null }[]>(Prisma.sql`
            SELECT "phone", "email"
            FROM "leads"
            WHERE "deletedAt" IS NULL
              AND (
                ${candidatePhones.length
                  ? Prisma.sql`regexp_replace(COALESCE("phone", ''), '[^0-9]', '', 'g') IN (${Prisma.join(candidatePhones)})`
                  : Prisma.sql`FALSE`}
                OR ${candidateEmails.length
                  ? Prisma.sql`lower(trim(COALESCE("email", ''))) IN (${Prisma.join(candidateEmails)})`
                  : Prisma.sql`FALSE`}
              )
          `)
        : [];

    const existingPhoneSet = new Set(
      existingMatches
        .map((row) => normalizePhone(row.phone))
        .filter((phone) => Boolean(phone)),
    );
    const existingEmailSet = new Set(
      existingMatches
        .map((row) => normalizeEmail(row.email))
        .filter((email) => Boolean(email)),
    );

    const seenPhoneSet = new Set<string>();
    const seenEmailSet = new Set<string>();
    const toCreate: any[] = [];
    const skippedRows: Array<{ rowNumber: number; reason: string }> = [];

    leads.forEach((lead, index) => {
      const rowNumber = index + 2; // +1 for header row, +1 for 1-based index
      const companyName = (lead.companyName ?? '').trim();
      const contactName = (lead.contactName ?? '').trim();
      const phone = (lead.phone ?? '').trim();
      const email = (lead.email ?? '').trim();
      const normalizedPhone = normalizePhone(phone);
      const normalizedEmail = normalizeEmail(email);

      if (!companyName || !contactName || !normalizedPhone) {
        skippedRows.push({ rowNumber, reason: 'invalid_row_missing_required_fields' });
        return;
      }

      const phoneExists = existingPhoneSet.has(normalizedPhone) || seenPhoneSet.has(normalizedPhone);
      const emailExists = normalizedEmail
        ? existingEmailSet.has(normalizedEmail) || seenEmailSet.has(normalizedEmail)
        : false;

      if (phoneExists || emailExists) {
        skippedRows.push({
          rowNumber,
          reason: phoneExists && emailExists
            ? 'duplicate_phone_and_email'
            : phoneExists
              ? 'duplicate_phone'
              : 'duplicate_email',
        });
        return;
      }

      seenPhoneSet.add(normalizedPhone);
      if (normalizedEmail) seenEmailSet.add(normalizedEmail);

      toCreate.push({
        companyName,
        contactName,
        email: email || null,
        phone,
        source: lead.source,
        value: Number(lead.value) || 0,
        priority: (lead.priority || 'Medium') as any,
        notes: lead.notes,
        milestoneId: lead.milestoneId || firstMilestone?.id,
        assignedToId: lead.assignedToId || user.id,
        createdById: user.id,
      });
    });

    const result = toCreate.length
      ? await prisma.$transaction(
          toCreate.map((lead) => prisma.lead.create({ data: lead })),
        )
      : [];

    return res.status(201).json({
      success: true,
      count: result.length,
      createdCount: result.length,
      skippedCount: skippedRows.length,
      skippedRows,
    });
  } catch (err: any) {
    console.error('Bulk import failed:', err);
    return res.status(500).json({ error: 'Bulk import failed: ' + err.message });
  }
});
