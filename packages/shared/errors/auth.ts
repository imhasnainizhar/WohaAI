// shared/errors/index.ts
import { logger } from "@shared/utils/logger";
import { ServiceException, ServiceResponse } from "@shared/utils/response"
import { ZodError } from "zod";
import { StandardError } from "./types";
import { sanitizedFieldErrors } from "./field";


/**
 * Throws a standardized validation error response for Zod schema failures.
 * @param error - ZodError from validation
 * @param field - Name of the field that failed validation
 */
export const throwValidationError = (error: ZodError, field?: string): never => {
  const fieldName = field ?? "input";
  logger.debug({ message: `${fieldName} validation failed`, issues: error.issues });

  throw new ServiceException(
    ServiceResponse.error<StandardError>({
      success: false,
      statusCode: 400,
      message: `Invalid ${fieldName}.`,
      errorType: "validation_error",
      errors: sanitizedFieldErrors(error),
    })
  );
};

/**
 * Throws a standardized conflict error (e.g., duplicate record in DB).
 * @param field - Name of the conflicting field
 * @param message - Custom conflict message
 */
export const throwConflictError = (field: string, message: string): never => {
  logger.debug(`Conflict on field: ${field} → ${message}`);
  throw new ServiceException(
    ServiceResponse.error<StandardError>({
      success: false,
      statusCode: 409,
      message,
      errorType: "conflict_error",
      errors: { [field]: [message] },
    })
  );
};

/**
 * Throws a standardized error when a session is expired or invalid.
 * Useful for signup/login flows or token validation.
 */
export const throwSessionExpired = (): never => {
  logger.debug("Session expired or invalid.");
  throw new ServiceException(
    ServiceResponse.error<StandardError>({
      success: false,
      statusCode: 400,
      message: "Invalid or expired session.",
      errorType: "validation_error",
    })
  );
};

/**
 * Throws a standardized internal server error for unexpected failures.
 * @param err - Optional error object for logging
 */
export const throwInternalError = (err?: any): never => {
  logger.error({ message: "Internal server error", error: err?.message });
  throw new ServiceException(
    ServiceResponse.error<StandardError>({
      success: false,
      statusCode: 500,
      message: err?.message ?? "Something went wrong on our side",
      errorType: "internal_server_error",
    })
  );
};

/**
 * Throws a forbidden access error (HTTP 403)
 * @param message - Optional custom message
 */
export const throwForbiddenError = (message?: string): never => {
  const msg = message ?? "You do not have permission to perform this action.";
  logger.debug(msg);
  throw new ServiceException(
    ServiceResponse.error<StandardError>({
      success: false,
      statusCode: 403,
      message: msg,
      errorType: "forbidden_error",
    })
  );
};

/**
 * Throws a not found error (HTTP 404)
 * @param resource - Optional resource name
 */
export const throwNotFoundError = (resource?: string): never => {
  const msg = resource ? `${resource} not found.` : "Resource not found.";
  logger.debug(msg);
  throw new ServiceException(
    ServiceResponse.error<StandardError>({
      success: false,
      statusCode: 404,
      message: msg,
      errorType: "not_found_error",
    })
  );
};
