import { Request, Response, NextFunction } from "express";
import { ServiceException, sendResponse } from "@shared/utils/response";

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
) => {

  // Known domain error
  if (err instanceof ServiceException) {
    return sendResponse({
      res,
      success: false,
      statusCode: err.response.statusCode,
      message: err.response.message,
      errors: err.response.errors,
      errorType: err.response.errorType,
      path: req.originalUrl,
    });
  }

  // Unknown fallback
  return sendResponse({
    res,
    success: false,
    statusCode: 500,
    message: "Internal server error",
    errorType: "internal_server_error",
    path: req.originalUrl,
  });
};
