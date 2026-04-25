import { Request, Response } from 'express';
import { prisma } from '../../prisma';
import { LeadStatus, LeadPriority } from '@prisma/client';
import { getLeadScopeFilter } from '../../utils/scoping';
import { asyncHandler } from '../../utils/async-handler';

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

  if (!companyName || !contactName || !phone || !assignedToId) {
    return res.status(400).json({ error: 'companyName, contactName, phone, assignedToId are required' });
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
      assignedToId,
      createdById: assignedToId,
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
    where: { id: id as string, ...getLeadScopeFilter(user) }
  });
  if (!existing) return res.status(404).json({ error: 'Lead not found or access denied' });

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
      ...(dispositionId !== undefined && { dispositionId }),
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
    include: LEAD_INCLUDE,
  });
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

    const result = await prisma.$transaction(
      leads.map(lead => prisma.lead.create({
        data: {
          companyName: lead.companyName,
          contactName: lead.contactName,
          email: lead.email,
          phone: lead.phone,
          source: lead.source,
          value: Number(lead.value) || 0,
          priority: (lead.priority || 'Medium') as any,
          notes: lead.notes,
          milestoneId: lead.milestoneId || firstMilestone?.id,
          assignedToId: lead.assignedToId || user.id,
          createdById: user.id,
        }
      }))
    );
    return res.status(201).json({ success: true, count: result.length });
  } catch (err: any) {
    console.error('Bulk import failed:', err);
    return res.status(500).json({ error: 'Bulk import failed: ' + err.message });
  }
});
