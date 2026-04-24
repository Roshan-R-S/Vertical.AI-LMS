import { Request, Response } from 'express';
import * as LeadsService from './leads.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiResponse } from '../../utils/apiResponse';
import { ApiError } from '../../utils/apiError';
import {
  createLeadSchema,
  updateLeadSchema,
  updateStageSchema,
  createActivitySchema,
} from './leads.schema';

export const getLeads = asyncHandler(async (req: Request, res: Response) => {
  const result = await LeadsService.getLeads(req.query, (req as any).user);
  res.status(200).json(new ApiResponse(200, result, "Leads fetched successfully"));
});

export const getLeadById = asyncHandler(async (req: Request, res: Response) => {
  const lead = await LeadsService.getLeadById(req.params['id'] as string, (req as any).user);
  if (!lead) {
    throw new ApiError(404, "Lead not found");
  }
  res.status(200).json(new ApiResponse(200, lead, "Lead fetched successfully"));
});

export const createLead = asyncHandler(async (req: Request, res: Response) => {
  const data = createLeadSchema.parse(req.body);
  const lead = await LeadsService.createLead(data, (req as any).user);
  res.status(201).json(new ApiResponse(201, lead, "Lead created successfully"));
});

export const bulkCreate = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user.canBulkUpload) {
    throw new ApiError(403, "You do not have permission to perform bulk uploads");
  }
  if (!Array.isArray(req.body)) throw new ApiError(400, "Request body must be an array of leads");
  const result = await LeadsService.bulkCreateLeads(req.body, user);
  res.status(201).json(new ApiResponse(201, result, "Leads bulk created successfully"));
});

export const updateLead = asyncHandler(async (req: Request, res: Response) => {
  const data = updateLeadSchema.parse(req.body);
  const lead = await LeadsService.updateLead(req.params['id'] as string, data, (req as any).user);
  res.status(200).json(new ApiResponse(200, lead, "Lead updated successfully"));
});

export const deleteLead = asyncHandler(async (req: Request, res: Response) => {
  await LeadsService.deleteLead(req.params['id'] as string, (req as any).user);
  res.status(200).json(new ApiResponse(200, null, "Lead deleted successfully"));
});

export const updateStage = asyncHandler(async (req: Request, res: Response) => {
  const { stage, remarks } = updateStageSchema.parse(req.body);
  const userId = (req as any).user.id;
  const result = await LeadsService.updateStage(
    req.params['id'] as string,
    stage,
    userId,
    (req as any).user,
    remarks
  );
  res.status(200).json(new ApiResponse(200, result, "Stage updated successfully"));
});

export const getAllActivities = asyncHandler(async (req: Request, res: Response) => {
  try {
    const activities = await LeadsService.getAllActivities(req.query, (req as any).user);
    res.status(200).json(new ApiResponse(200, activities, "Global activities fetched successfully"));
  } catch (err: any) {
    console.error('[Error] getAllActivities failed:', err);
    throw err; // Re-throw to let asyncHandler handle the error status
  }
});

export const getActivities = asyncHandler(async (req: Request, res: Response) => {
  const activities = await LeadsService.getActivities(req.params['id'] as string, (req as any).user);
  res.status(200).json(new ApiResponse(200, activities, "Activities fetched successfully"));
});

export const addActivity = asyncHandler(async (req: Request, res: Response) => {
  const { type, content } = createActivitySchema.parse(req.body);
  const userId = (req as any).user.id;
  const activity = await LeadsService.addActivity(
    req.params['id'] as string,
    type,
    content,
    userId,
    (req as any).user
  );
  res.status(201).json(new ApiResponse(201, activity, "Activity added successfully"));
});
