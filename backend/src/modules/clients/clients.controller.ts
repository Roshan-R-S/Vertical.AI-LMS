import { Request, Response, NextFunction } from 'express';
import { ClientService } from './clients.service';

export const ClientController = {
  getAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const skip = parseInt(req.query.skip as any) || 0;
      const take = parseInt(req.query.take as any) || 20;
      const result = await ClientService.getAllClients(skip, take);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const client = await ClientService.getClientById(req.params.id as string);
      if (!client) return res.status(404).json({ error: 'Client not found' });
      res.json(client);
    } catch (error) {
      next(error);
    }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const client = await ClientService.createClient(req.body);
      res.status(201).json(client);
    } catch (error) {
      next(error);
    }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const client = await ClientService.updateClient(req.params.id as string, req.body);
      res.json(client);
    } catch (error) {
      next(error);
    }
  },

  remove: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await ClientService.deleteClient(req.params.id as string);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
