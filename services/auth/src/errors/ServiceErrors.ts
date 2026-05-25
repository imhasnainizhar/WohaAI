import { logger } from "../helpers/logger";
import {
    ServiceException,
    ServiceResponse
} from "../helpers/response";

export class ServiceErrors {
    /**
     * Zod validation error
     */
    static validation(
        error: any,
        field: string
    ): never {
        logger.debug({
            message: `${field} validation failed`,
            issues: error.issues,
        });

        throw new ServiceException(
            ServiceResponse.error({
                success: false,
                statusCode: 400,
                message: `Invalid ${field}.`,
                errorType: "validation_error",
                errors: error.flatten().fieldErrors,
            })
        );
    }

    /**
     * Conflict error
     */
    static conflict(
        field: string,
        message: string
    ): never {
        logger.debug({
            message: `Conflict on field: ${field}`,
            error: message,
        });

        throw new ServiceException(
            ServiceResponse.error({
                success: false,
                statusCode: 409,
                message,
                errorType: "conflict_error",
                errors: {
                    [field]: [message],
                },
            })
        );
    }

    /**
     * Expired signup session
     */
    static sessionExpired(): never {
        logger.debug(
            "Session timed out or invalid."
        );

        throw new ServiceException(
            ServiceResponse.error({
                success: false,
                statusCode: 400,
                message:
                    "Invalid or expired signup session and tokens.",
                errorType: "validation_error",
            })
        );
    }

    /**
     * Internal server error
     */
    static internal(err?: any): never {
        logger.error({
            message: "Internal server error",
            error: err?.message,
        });

        throw new ServiceException(
            ServiceResponse.error({
                success: false,
                statusCode: 500,
                message:
                    err?.message ??
                    "Something went wrong on our side",
                errorType:
                    "internal_server_error",
            })
        );
    }
}