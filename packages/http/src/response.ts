import { Response } from "express";
import { Cookie } from "./cookie";

export interface ApiResponseOptions<T = unknown> {
  res: Response;
  success?: boolean; // defaults handled inside sendResponse
  statusCode?: number;
  message: string;
  data?: T;
  cookies?: Cookie[];
  errors?: Record<string, string[]>;
  errorType?: string;
  path?: string;
}

/**
 * Send structured HTTP JSON response.
 */
export const sendResponse = <T>({
  res,
  success = true,
  statusCode = success ? 200 : 500,
  message,
  data,
  cookies,
  errors,
  errorType,
  path,
}: ApiResponseOptions<T>): Response => {
  // Attach cookies if any
  if (cookies && cookies.length > 0) {
    cookies.forEach((cookie) => {
      res.cookie(cookie.name, cookie.value, cookie.options);
    });
  }

  // Build payload
  const payload = {
    success,
    statusCode,
    message,
    data: success ? data ?? null : undefined,
    errors: success ? undefined : errors ?? null,
    errorType: success ? undefined : errorType ?? "internal_server_error",
    timestamp: new Date().toISOString(),
    path,
  };

  return res.status(statusCode).json(payload);
};