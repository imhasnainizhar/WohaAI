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

        this.name = this.constructor.name;

        Error.captureStackTrace?.(this, this.constructor);
    }
}

// Validation Error (Zod)
export class ValidationError extends ServiceError {
    constructor(
        message?: string,
        errors?: ZodError,
    ) {
        super(
            message
                ? message : "Validation error",
            "validation_error",
            400,
            errors && sanitizedFieldErrors(errors)
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

// Verification code expired errpr
export class VerificationCodeExpiredError extends ServiceError {
    constructor() {
        super(
            "Invalid or expired verification code.",
            "verification_code_expired",
            400,
            {
                verificationCode: ["Verification code expired"],
            },
        );
    }
}

// Invalid verificaiton code error
export class InvalidVerificationCodeError extends ServiceError {
    constructor() {
        super(
            "Invalid verification code.",
            "invalid_verification_code",
            401,
            {
                verification_code: [
                    "The provided verification code is incorrect.",
                ],
            }
        );
    }
}

// Bad gateway error
export class BadGatewayError extends ServiceError {
    constructor(params?: {
        message?: string;
        errorType?: string;
        errors?: Record<string, string[]>;
    }) {
        super(
            params?.message ?? "Bad gateway",
            params?.errorType ?? "bad_gateway",
            502,
            params?.errors
        );

        this.name = "BadGatewayError";
    }
}

export class EmailVerificationRequiredError extends ServiceError {
    constructor(
        message: string = "Email verification required."
    ) {
        super(
            message,
            "email_verification_required",
            401
        );

        this.name = "EmailVerificationRequiredError";
    }
}

export class MaliciousActivityError extends ServiceError {
    constructor(
        message: string = "Suspicious or malicious activity detected.",
        options?: {
            errorType?: string;
            errors?: Record<string, string[]>;
        }
    ) {
        super(
            message,
            options?.errorType ?? "malicious_activity_detected",
            403,
            options?.errors
        );

        this.name = "MaliciousActivityError";
    }
}

// Internal Error
export class InternalServerError extends ServiceError {
    constructor(err?: unknown) {
        super(
            err instanceof Error
                ? err.message
                : "Something went wrong on our side",
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

// Invalid credentials Error
export class InvalidCredentialsError extends ServiceError {
    constructor() {
        super(
            "Invalid credentials.",
            "invalid_credentials_error",
            401,
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