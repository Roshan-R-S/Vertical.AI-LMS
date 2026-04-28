import { Request, Response } from 'express';
import { prisma } from '../../prisma';
import { InvoiceStatus } from '@prisma/client';
import { getInvoiceScopeFilter } from '../../utils/scoping';
import { asyncHandler } from '../../utils/async-handler';
import { notify } from '../../utils/notify';

// GET /api/v1/invoices
export const getInvoices = asyncHandler(async (req: Request, res: Response) => {
  const status = req.query.status as string | undefined;
  const clientId = req.query.clientId as string | undefined;
  const search = req.query.search as string | undefined;

  const invoices = await prisma.invoice.findMany({
    where: {
      ...getInvoiceScopeFilter((req as any).user),
      ...(status && { status: status as InvoiceStatus }),
      ...(clientId && { clientId }),
      ...(search && {
        OR: [
          { invoiceNumber: { contains: search, mode: 'insensitive' } },
          { client: { companyName: { contains: search, mode: 'insensitive' } } },
        ],
      }),
    },
    include: { client: true, items: true, attachments: true },
    orderBy: { issueDate: 'desc' },
  });

  return res.json(invoices.map(inv => ({
    id: inv.invoiceNumber,
    clientId: inv.clientId,
    clientName: inv.client.companyName,
    amount: inv.amount,
    gst: inv.gst,
    total: inv.total,
    status: inv.status,
    issueDate: new Date(inv.issueDate).toISOString().split('T')[0],
    dueDate: new Date(inv.dueDate).toISOString().split('T')[0],
    paidDate: inv.paidDate ? new Date(inv.paidDate).toISOString().split('T')[0] : null,
    paidAmount: inv.paidAmount,
    items: inv.items.map(i => ({ desc: i.description, amount: i.amount })),
    pdfUrl: inv.attachments?.[0]?.id ? `/api/v1/attachments/${inv.attachments[0].id}/download` : inv.pdfUrl,
  })));
});

// POST /api/v1/invoices
export const createInvoice = asyncHandler(async (req: Request, res: Response) => {
  const { clientId, amount, dueDate, items, invoiceNumber } = req.body;
  if (!clientId || !amount || !dueDate) {
    return res.status(400).json({ error: 'clientId, amount, dueDate are required' });
  }
  const gst = Math.round(amount * 0.18);
  const total = amount + gst;

  // Auto-generate invoice number if not provided
  const lastInvoice = await prisma.invoice.findFirst({ orderBy: { createdAt: 'desc' } });
  const num = invoiceNumber ?? `INV-${new Date().getFullYear()}-${String((lastInvoice ? parseInt(lastInvoice.invoiceNumber.split('-').pop()!) : 0) + 1).padStart(3, '0')}`;

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber: num, 
      clientId, 
      amount, 
      gst, 
      total, 
      status: req.body.status || 'unpaid',
      issueDate: req.body.issueDate ? new Date(req.body.issueDate) : undefined,
      dueDate: new Date(dueDate),
      pdfUrl: req.body.pdfUrl,
      items: items ? { create: items.map((i: any) => ({ description: i.desc, amount: i.amount })) } : undefined,
    },
    include: { client: true, items: true },
  });

  return res.status(201).json(invoice);
});

// PATCH /api/v1/invoices/:id/mark-paid
export const markInvoicePaid = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = (req as any).user;
  const { paidAmount } = req.body;

  const invoice = await prisma.invoice.findFirst({ 
    where: { invoiceNumber: id as string, ...getInvoiceScopeFilter(user) } 
  });
  if (!invoice) return res.status(404).json({ error: 'Invoice not found or access denied' });

  const isPartial = paidAmount && paidAmount < invoice.total;
  const updated = await prisma.invoice.update({
    where: { id: invoice.id },
    data: {
      status: isPartial ? 'partial' : 'paid',
      paidDate: new Date(),
      paidAmount: paidAmount ?? invoice.total,
    },
    include: { client: { include: { accountManager: true } }, items: true },
  });

  // Notify the account manager
  if (updated.client.accountManagerId) {
    const label = isPartial ? 'Partial payment received' : 'Invoice paid in full';
    await notify(
      updated.client.accountManagerId,
      `${label} for "${updated.client.companyName}" — Invoice ${invoice.invoiceNumber}`,
      isPartial ? 'warning' : 'success'
    );
  }

  return res.json(updated);
});
