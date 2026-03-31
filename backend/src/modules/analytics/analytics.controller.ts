import { Request, Response } from 'express';
import * as AnalyticsService from './analytics.service';

export const getDashboard = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const stats = await AnalyticsService.getDashboardStats(user.id, user.role);
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getPipeline = async (req: Request, res: Response) => {
  try {
    const stats = await AnalyticsService.getPipelineStats();
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getExecutiveStats = async (req: Request, res: Response) => {
  try {
    const stats = await AnalyticsService.getExecutiveStats();
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};