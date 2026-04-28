import { TaskStatus } from '@prisma/client';
import { Request, Response } from 'express';
import { prisma } from '../../prisma';
import { asyncHandler } from '../../utils/async-handler';
import { getTaskScopeFilter } from '../../utils/scoping';

// GET /api/v1/tasks
export const getTasks = asyncHandler(async (req: Request, res: Response) => {
  const { assignedToId, status, leadId } = req.query as any;
  const tasks = await prisma.task.findMany({
    where: {
      ...getTaskScopeFilter((req as any).user),
      ...(assignedToId && { assignedToId }),
      ...(status && { status: status as TaskStatus }),
      ...(leadId && { leadId }),
    },
    include: {
      assignedTo: { include: { team: true } },
      createdBy: true,
      lead: { select: { id: true, companyName: true, contactName: true } },
    },
    orderBy: { dueDate: 'asc' },
  });

  return res.json(tasks.map(formatTask));
});

const formatTask = (t: any) => ({
  id: t.id,
  title: t.title,
  leadId: t.leadId,
  leadCompany: t.lead?.companyName ?? null,
  bde: t.assignedTo?.name ?? 'Unassigned',
  bdeId: t.assignedToId,
  tl: t.assignedTo?.team?.name ?? null,
  dueDate: t.dueDate.toISOString().split('T')[0],
  followUpDateTo: t.followUpDateTo ? t.followUpDateTo.toISOString().split('T')[0] : null,
  status: t.status,
  type: t.type,
  followUpReason: t.followUpReason,
  createdAt: t.createdAt,
});

// POST /api/v1/tasks
export const createTask = asyncHandler(async (req: Request, res: Response) => {
  const { title, leadId, assignedToId, createdById, dueDate, type, followUpDateTo, followUpReason } = req.body;
  if (!title || !assignedToId || !dueDate) {
    return res.status(400).json({ error: 'title, assignedToId, dueDate are required' });
  }
  const task = await prisma.task.create({
    data: {
      title,
      leadId: leadId || null,
      assignedToId,
      createdById: createdById ?? assignedToId,
      dueDate: new Date(dueDate),
      type: type || 'general',
      followUpDateTo: followUpDateTo ? new Date(followUpDateTo) : null,
      followUpReason: followUpReason || null,
      status: 'pending',
    },
    include: {
      assignedTo: { include: { team: true } },
      lead: { select: { id: true, companyName: true } },
    },
  });
  return res.status(201).json(formatTask(task));
});

// PATCH /api/v1/tasks/:id
export const updateTask = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = (req as any).user;
  const { title, status, dueDate, assignedToId, type, followUpDateTo, followUpReason } = req.body;

  const existing = await prisma.task.findFirst({
    where: { id: id as string, ...getTaskScopeFilter(user) }
  });
  if (!existing) return res.status(404).json({ error: 'Task not found or access denied' });

  const task = await prisma.task.update({
    where: { id: id as string },
    data: {
      ...(title && { title }),
      ...(status && { status: status as TaskStatus }),
      ...(dueDate && { dueDate: new Date(dueDate) }),
      ...(assignedToId && { assignedToId }),
      ...(type && { type }),
      ...(followUpDateTo !== undefined && { followUpDateTo: followUpDateTo ? new Date(followUpDateTo) : null }),
      ...(followUpReason !== undefined && { followUpReason }),
    },
    include: {
      assignedTo: { include: { team: true } },
      lead: { select: { id: true, companyName: true } },
    },
  });
  return res.json(formatTask(task));
});
