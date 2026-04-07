import { Request, Response, NextFunction } from 'express';
import { InvoiceService } from './invoices.service';

export const InvoiceController = {
  getAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const skip = parseInt(req.query.skip as any) || 0;
      const take = parseInt(req.query.take as any) || 20;
      const result = await InvoiceService.getAllInvoices(skip, take);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const invoice = await InvoiceService.getInvoiceById(req.params.id as string);
      if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
      res.json(invoice);
    } catch (error) {
      next(error);
    }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const invoice = await InvoiceService.createInvoice({
        ...req.body,
        date: new Date(req.body.date || new Date()),
        dueDate: new Date(req.body.dueDate)
      });
      res.status(201).json(invoice);
    } catch (error) {
      next(error);
    }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const invoice = await InvoiceService.updateInvoice(req.params.id as string, req.body);
      res.json(invoice);
    } catch (error) {
      next(error);
    }
  },

  remove: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await InvoiceService.deleteInvoice(req.params.id as string);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
