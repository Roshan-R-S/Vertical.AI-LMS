import { InvoiceRepo } from './invoices.repository';

export const InvoiceService = {
  getAllInvoices: async (skip?: number, take?: number) => {
    const [invoices, total] = await Promise.all([
      InvoiceRepo.findAll(skip, take),
      InvoiceRepo.count(),
    ]);
    return { invoices, total };
  },

  getInvoiceById: (id: string) => InvoiceRepo.findById(id),

  createInvoice: (data: any) => InvoiceRepo.create(data),

  updateInvoice: (id: string, data: any) => InvoiceRepo.update(id, data),

  deleteInvoice: (id: string) => InvoiceRepo.delete(id),
};
