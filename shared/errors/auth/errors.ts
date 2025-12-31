import { logger } from "@utils/common/logger";
import { ServiceException, ServiceResponse } from "@utils/common/response";

/**
 * Throws standardized validation error response for Zod schema failures.
 */
export const throwValidationError = (error: any, field: string) => {
  logger.warn({ message: `${field} validation failed`, issues: error.issues });
  throw new ServiceException(
    ServiceResponse.error({
      success: false,
      statusCode: 400,
      message: `Invalid ${field}.`,
      errorType: "validation_error",
      errors: error.flatten().fieldErrors,
    })
  );
};

/**
 * Throws a conflict error (e.g., duplicate email in database).
 */
export const throwConflictError = (field: string, message: string) => {
  logger.warn(`Conflict on field: ${field} → ${message}`);
  throw new ServiceException(
    ServiceResponse.error({
      success: false,
      statusCode: 409,
      message,
      errorType: "conflict_error",
      errors: { [field]: [message] },
    })
  );
};

/**
 * Throws when the Redis signup session is missing or expired.
 * 
 * This prevents reuse of expired sessions or bypassing signup verification flow.
 */
export const throwSessionExpired = () => {
  logger.warn("Session timed out or invalid.");
  throw new ServiceException(
    ServiceResponse.error({
      success: false,
      statusCode: 400,
      message: "Invalid or expired signup session and tokens.",
      errorType: "validation_error",
    })
  );
};

/**
 * Standardized internal error response for unexpected failures.
 */
export const internalError = (err?: any) =>
  new ServiceException(
    ServiceResponse.error({
      success: false,
      statusCode: 500,
      message: err?.message ?? "Something went wrong on our side",
      errorType: "internal_server_error",
    })
  );
