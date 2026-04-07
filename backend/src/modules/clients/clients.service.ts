import { ClientRepo } from './clients.repository';

export const ClientService = {
  getAllClients: async (skip?: number, take?: number) => {
    const [clients, total] = await Promise.all([
      ClientRepo.findAll(skip, take),
      ClientRepo.count(),
    ]);
    return { clients, total };
  },

  getClientById: (id: string) => ClientRepo.findById(id),

  createClient: (data: any) => ClientRepo.create(data),

  updateClient: (id: string, data: any) => ClientRepo.update(id, data),

  deleteClient: (id: string) => ClientRepo.delete(id),
};
