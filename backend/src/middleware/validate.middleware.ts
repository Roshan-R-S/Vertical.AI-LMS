import { Request, Response, NextFunction } from 'express';
import { ZodObject, ZodError } from 'zod';
import { ApiResponse } from '../utils/apiResponse';

export const validateRequest = (schema: ZodObject<any>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json(
          new ApiResponse(
            400,
            error.issues.map((e) => ({
              path: e.path.join('.'),
              message: e.message,
            })),
            'Validation failed'
          )
        );
      }
      next(error);
    }
  };
};
