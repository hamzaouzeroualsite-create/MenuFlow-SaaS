import { Response } from 'express';
import { ApiResponse } from '@menuflow/shared';

export function sendSuccess<T>(res: Response, data: T, message?: string, status = 200): void {
  const response: ApiResponse<T> = { success: true, data, message };
  res.status(status).json(response);
}

export function sendError(res: Response, error: string, status = 400): void {
  const response: ApiResponse = { success: false, error };
  res.status(status).json(response);
}

export function sendPaginated<T>(
  res: Response,
  data: T[],
  total: number,
  page: number,
  limit: number
): void {
  const response: ApiResponse<T[]> = {
    success: true,
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
  res.json(response);
}

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode = 400
  ) {
    super(message);
    this.name = 'AppError';
  }
}
