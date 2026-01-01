import { Response } from "express";
import { Cookie } from "../common/auth/cookie";
import { ApiResponseOptions } from "../../auth/domain/types/api/response";

/* -------------------------------------------------------
   SERVICE RESPONSE (for internal services)
-------------------------------------------------------- */
export class ServiceResponse<T = unknown> {
  readonly success!: boolean;
  readonly statusCode!: number;
  readonly message!: string;
  readonly data?: T;
  readonly cookies?: Cookie[];
  readonly errorType?: string;
  readonly errors?: Record<string, string[]>;

  private constructor(params: {
    success: boolean;
    statusCode: number;
    message: string;
    data?: T;
    cookies?: Cookie[];
    errorType?: string;
    errors?: Record<string, string[]>;
  }) {
    Object.assign(this, params);
  }

  // ✅ Factory: Success
  static success<T>(params: {
    success: boolean;
    statusCode?: number;
    message: string;
    data?: T;
    cookies?: Cookie[];
  }): ServiceResponse<T> {
    return new ServiceResponse<T>({
      success: true,
      statusCode: params.statusCode ?? 200,
      message: params.message,
      data: params.data,
      cookies: params.cookies,
    });
  }

  // ❌ Factory: Error
  static error<T>(params: {
    success: boolean;
    statusCode: number;
    message: string;
    errorType?: string;
    errors?: Record<string, string[]>;
  }): ServiceResponse<T> {
    return new ServiceResponse<T>({
      success: false,
      statusCode: params.statusCode,
      message: params.message,
      errorType: params.errorType,
      errors: params.errors,
    });
  }
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

/* -------------------------------------------------------
   SERVICE EXCEPTION (Throwable wrapper)
-------------------------------------------------------- */
export class ServiceException<T = unknown> extends Error {
  public readonly response: ServiceResponse<T>;

  constructor(response: ServiceResponse<T> | ApiResponseOptions<T>) {
    super(response.message);
    this.name = "ServiceException";

    // 🔧 Normalize: if ApiResponseOptions, wrap into ServiceResponse
    if (response instanceof ServiceResponse) {
      this.response = response;
    } else {
      this.response = ServiceResponse.error({
        success: response.success ?? false,
        statusCode: response.statusCode ?? 500,
        message: response.message,
        errorType: response.errorType ?? "internal_server_error",
        errors: response.errors,
      });
    }

    Object.setPrototypeOf(this, new.target.prototype);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
