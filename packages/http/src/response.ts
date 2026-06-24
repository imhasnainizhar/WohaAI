import { Cookie, CookieOptions } from "./cookie";

export interface HttpResponse {
  status(code: number): this;
  json(payload: unknown): this;

  cookie?(
    name: string,
    value: string,
    options?: unknown
  ): this;

  setCookie?(cookie: Cookie): this;
}

/**
 * @http Options with which handlers call sendResponse 
 */
export interface ApiResponseOptions<T = unknown> {
  res: HttpResponse;
  statusCode: number;
  success: boolean; // defaults handled inside sendResponse
  message: string;
  data?: T;
  cookies?: Cookie[];
  errors?: Record<string, string[]>;
  errorType?: string;
  path?: string;
}

/**
 * @http Response body structure
 */
export interface ApiResponseBody<T = unknown> {
  success: boolean;
  message: string;
  data?: T | null;
  errors?: Record<string, string[]> | null;
  errorType?: string;
  timestamp: string;
  path?: string;
}

/**
 * Send structured HTTP JSON response.
 */
export const sendResponse = <T>({
  res,
  success,
  statusCode,
  message,
  data,
  cookies,
  errors,
  errorType,
  path,
}: ApiResponseOptions<T>): HttpResponse => {
  // Attach cookies if any
  if (cookies && cookies.length > 0) {
    cookies.forEach((cookie) => {
      res.setCookie?.(cookie);
    });
  }

  // Build payload
  const payload: ApiResponseBody = {
    success,
    message,
    data: success ? data ?? null : undefined,
    errors: success ? undefined : errors ?? null,
    errorType: success ? undefined : errorType ?? "internal_server_error",
    timestamp: new Date().toISOString(),
    path,
  };

  return res.status(statusCode).json(payload);
};