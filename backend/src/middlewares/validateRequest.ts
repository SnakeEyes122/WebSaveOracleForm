import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const zodErr: any = error;
        const errors = zodErr.errors.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message
        }));
        return res.status(400).json({ error: 'Validation failed', details: errors });
      }
      next(error);
    }
  };
};
