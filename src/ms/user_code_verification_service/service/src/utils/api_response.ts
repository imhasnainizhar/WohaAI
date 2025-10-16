import { Response } from "express";

interface ApiResponseOptions<T> {
  res: Response;
  success?: boolean; // default false for error
  message: string;
  statusCode: number;
  data?: T;
  errors?: Record<string, string[]>;
  errorType?: string;
  path?: string;
}

export const sendResponse = <T>({
  res,
  success = true,
  message,
  statusCode = success ? 200 : 500,
  data,
  errors,
  errorType = "internal_server_error",
  path,
}: ApiResponseOptions<T>) => {
  return res.status(statusCode).json({
    success,
    statusCode,
    message,
    data: success ? data ?? null : undefined,
    errors: success ? undefined : errors ?? null,
    errorType: success ? undefined : errorType,
    timestamp: new Date().toISOString(),
    path,
  });
};
