import { Request, Response } from 'express';
import { prisma } from '../../prisma';
import { ClientStatus } from '@prisma/client';
import { getClientScopeFilter } from '../../utils/scoping';
import { asyncHandler } from '../../utils/async-handler';
import { notify } from '../../utils/notify';

function formatClient(c: any) {
  return {
    id: c.id,
    companyName: c.companyName,
    contactName: c.contactName,
    email: c.email,
    phone: c.phone,
    industry: c.industry,
    products: c.products,
    orderValue: c.orderValue,
    contractDuration: c.contractDuration,
    startDate: c.startDate ? new Date(c.startDate).toISOString().split('T')[0] : null,
    renewalDate: c.renewalDate ? new Date(c.renewalDate).toISOString().split('T')[0] : null,
    status: c.status,
    linkedLeadId: c.linkedLeadId,
    accountManager: c.accountManager?.name ?? null,
    accountManagerId: c.accountManagerId,
    documents: [], // attachment file names fetched separately
    createdAt: c.createdAt,
  };
}

// GET /api/v1/clients
export const getClients = asyncHandler(async (req: Request, res: Response) => {
  const status = req.query.status as string | undefined;
  const search = req.query.search as string | undefined;

  const clients = await prisma.client.findMany({
    where: {
      ...getClientScopeFilter((req as any).user),
      ...(status && { status: status as ClientStatus }),
      ...(search && {
        OR: [
          { companyName: { contains: search, mode: 'insensitive' } },
          { contactName: { contains: search, mode: 'insensitive' } },
        ],
      }),
    },
    include: { accountManager: true },
    orderBy: { createdAt: 'desc' },
  });
  return res.json(clients.map(formatClient));
});

// GET /api/v1/clients/:id
export const getClientById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = (req as any).user;
  const client = await prisma.client.findFirst({
    where: { 
      id: id as string,
      ...getClientScopeFilter(user)
    },
    include: {
      accountManager: true,
      invoices: { include: { items: true }, orderBy: { issueDate: 'desc' } },
    },
  });
  if (!client) return res.status(404).json({ error: 'Client not found' });
  return res.json({ ...formatClient(client), invoices: (client as any).invoices });
});

// POST /api/v1/clients
export const createClient = asyncHandler(async (req: Request, res: Response) => {
  const {
    companyName, contactName, email, phone, industry, products,
    orderValue, contractDuration, startDate, renewalDate,
    accountManagerId, linkedLeadId,
  } = req.body;

  if (!companyName || !contactName || !email || !phone) {
    return res.status(400).json({ error: 'companyName, contactName, email, phone are required' });
  }

  const client = await prisma.client.create({
    data: {
      companyName, contactName, email, phone, industry,
      products: products ?? [],
      orderValue: orderValue ?? 0,
      contractDuration,
      startDate: startDate ? new Date(startDate) : undefined,
      renewalDate: renewalDate ? new Date(renewalDate) : undefined,
      status: 'active',
      linkedLeadId, accountManagerId,
    },
    include: { accountManager: true },
  });
  return res.status(201).json(formatClient(client));
});

// PATCH /api/v1/clients/:id
export const updateClient = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = (req as any).user;
  const {
    companyName, contactName, email, phone, industry, products,
    orderValue, contractDuration, startDate, renewalDate, status, accountManagerId,
  } = req.body;

  const existing = await prisma.client.findFirst({
    where: { id: id as string, ...getClientScopeFilter(user) }
  });
  if (!existing) return res.status(404).json({ error: 'Client not found or access denied' });

  const client = await prisma.client.update({
    where: { id: id as string },
    data: {
      ...(companyName && { companyName }),
      ...(contactName && { contactName }),
      ...(email && { email }),
      ...(phone && { phone }),
      ...(industry !== undefined && { industry }),
      ...(products !== undefined && { products }),
      ...(orderValue !== undefined && { orderValue }),
      ...(contractDuration !== undefined && { contractDuration }),
      ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
      ...(renewalDate !== undefined && { renewalDate: renewalDate ? new Date(renewalDate) : null }),
      ...(status && { status: status as ClientStatus }),
      ...(accountManagerId !== undefined && { accountManagerId }),
    },
    include: { accountManager: true },
  });

  // Notify when renewal_due status is set
  if (status === 'renewal_due' && existing.status !== 'renewal_due' && client.accountManagerId) {
    await notify(client.accountManagerId, `Client "${client.companyName}" renewal is due — take action now`, 'warning');
  }

  // Notify on account manager reassignment
  if (accountManagerId && accountManagerId !== existing.accountManagerId) {
    await notify(accountManagerId, `Client "${client.companyName}" has been assigned to you`, 'info');
  }

  return res.json(formatClient(client));
});

// DELETE /api/v1/clients/:id
export const deleteClient = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = (req as any).user;

  const existing = await prisma.client.findFirst({
    where: { id: id as string, ...getClientScopeFilter(user) }
  });
  if (!existing) return res.status(404).json({ error: 'Client not found or access denied' });

  await prisma.client.update({
    where: { id: id as string },
    data: { deletedAt: new Date() }
  });

  return res.json({ success: true, message: 'Client deleted successfully' });
});
