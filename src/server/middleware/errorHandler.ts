import { Request, Response } from 'express';
import { ApiError } from '../../shared/types/api.js';

export const errorHandler = (err: Error | ApiError, req: Request, res: Response) => {
  console.error('Error occurred:', err);

  // Handle custom API errors
  if ('status' in err) {
    return res.status(err.status).json({
      success: false,
      message: err.message,
      code: err.code,
    });
  }

  // Handle generic errors
  const status = 500;
  const message = process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message;

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
  });
};
