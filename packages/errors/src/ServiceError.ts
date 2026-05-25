import { ZodError } from "zod";
import { sanitizedFieldErrors } from "./field";

// Base domain error
export class ServiceError extends Error {
    constructor(
        message: string,
        public readonly errorType: string,
        public readonly statusCode: number,
        public readonly errors?: Record<string, string[]>,
    ) {
        super(message);
        this.name = "AppError";
    }
}

// Validation Error (Zod)
export class ValidationError extends ServiceError {
    constructor(
        message: string,
        errors: ZodError,
    ) {
        super(
            message,
            "validation_error",
            400,
            sanitizedFieldErrors(errors)
        );
    }
}

// Conflict Error
export class ConflictError extends ServiceError {
    constructor(
        field: string,
        message: string,
    ) {
        super(
            message,
            "conflict_error",
            409,
            {
                [field]: [message],
            },
        );
    }
}

// Session Error
export class SessionExpiredError extends ServiceError {
    constructor() {
        super(
            "Invalid or expired session.",
            "session_expired",
            400,
            {
                session: ["Session expired"],
            },
        );
    }
}

// Internal Error
export class InternalServerError extends ServiceError {
    constructor(err?: any) {
        super(
            err?.message ??
            "Something went wrong on our side",
            "internal_server_error",
            500,
        );
    }
}

// Forbidden Error
export class ForbiddenError extends ServiceError {
    constructor(message?: string) {
        super(
            message ??
            "You do not have permission to perform this action.",
            "forbidden_error",
            403,
        );
    }
}

// Not Found Error
export class NotFoundError extends ServiceError {
    constructor(resource?: string) {
        super(
            resource
                ? `${resource} not found.`
                : "Resource not found.",
            "not_found_error",
            404,
        );
    }
}