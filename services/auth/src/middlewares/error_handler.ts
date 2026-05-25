import {
  Request,
  Response,
  NextFunction,
} from "express";

import { logger } from "@packages/observability";
import { ServiceError } from "@packages/errors";
import { sendResponse } from "@packages/http";

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  // Known domain/application errors
  if (err instanceof ServiceError) {
      return sendResponse({
          res,
          success: false,
          statusCode: err.statusCode,
          message: err.message,
          errors: err.errors,
          errorType: err.errorType,
          path: req.originalUrl,
      });
  }

  // Unexpected/unhandled errors
  logger.error({
      message:
          "Unhandled application error",
      path: req.originalUrl,
      error:
          err instanceof Error
              ? err.stack
              : String(err),
  });

  return sendResponse({
      res,
      success: false,
      statusCode: 500,
      message:
          "Internal server error",
      errorType:
          "internal_server_error",
      path: req.originalUrl,
  });
};