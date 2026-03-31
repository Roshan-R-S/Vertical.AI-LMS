import { TaskRepo } from './tasks.repository';

export const getTasks = async (leadId: string) => {
  return TaskRepo.findAll({ leadId });
};

export const createTask = async (data: any) => {
  return TaskRepo.create(data);
};

export const updateTask = async (id: string, data: any) => {
  return TaskRepo.update(id, data);
};

export const deleteTask = async (id: string) => {
  return TaskRepo.delete(id);
};
