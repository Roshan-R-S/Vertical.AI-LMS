import { Request, Response } from 'express';
import * as TasksService from './tasks.service';
import { ApiResponse } from '../../utils/apiResponse';
import { asyncHandler } from '../../utils/asyncHandler';

export const TasksController = {
  getTasks: asyncHandler(async (req: Request, res: Response) => {
    const { leadId } = req.query;
    const tasks = await TasksService.getTasks(leadId as string);
    res.json(new ApiResponse(200, tasks));
  }),

  createTask: asyncHandler(async (req: Request, res: Response) => {
    const task = await TasksService.createTask({
      ...req.body,
      createdBy: (req as any).user.id,
    });
    res.status(201).json(new ApiResponse(201, task, 'Task created successfully'));
  }),

  updateTask: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const task = await TasksService.updateTask(id as string, req.body);
    res.json(new ApiResponse(200, task, 'Task updated successfully'));
  }),

  deleteTask: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await TasksService.deleteTask(id as string);
    res.json(new ApiResponse(200, null, 'Task deleted successfully'));
  }),
};
