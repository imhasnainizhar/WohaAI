import jwt from "jsonwebtoken";
import { ZodError } from "zod";

// Will be reviewed later, currently importing from users prisma.
import { PrismaClientKnownRequestError } from "@packages/prisma-users";

import {
    ServiceError,
    ValidationError,
    ConflictError,
    SessionExpiredError,
    BadGatewayError,
    InternalServerError,
} from "./service-error";

/**
 * Converts unknown external/library/runtime errors
 * into stable application-level ServiceErrors.
 */
function normalizeError(err: unknown): ServiceError {
    /**
     * Already normalized
     */
    if (err instanceof ServiceError) {
        return err;
    }

    /**
     * Zod validation
     */
    if (err instanceof ZodError) {
        return new ValidationError("zod validation error", err);
    }

    /**
     * JWT errors
     */
    if (
        err instanceof jwt.TokenExpiredError ||
        err instanceof jwt.JsonWebTokenError
    ) {
        return new SessionExpiredError();
    }

    /**
     * Infrastructure/network errors
     */
    if (err instanceof Error) {
        const message = err.message.toLowerCase();

        if (
            message.includes("redis") ||
            message.includes("econnrefused") ||
            message.includes("timeout")
        ) {
            return new BadGatewayError({
                message: "Infrastructure service unavailable.",
            });
        }
    }

    /**
     * Unknown fallback
     */
    return new InternalServerError(err);
}

/**
 * Throwable normalized error wrapper.
 *
 * Usage:
 * throw new NormalizedError(err);
 */
export class NormalizedError extends ServiceError {
    constructor(err: unknown) {
        const normalized = normalizeError(err);

        super(
            normalized.message,
            normalized.errorType,
            normalized.statusCode,
            normalized.errors,
        );

        this.name = "NormalizedError";

        /**
         * Preserve original stack if possible
         */
        if (normalized.stack) {
            this.stack = normalized.stack;
        }
    }
}