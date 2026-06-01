import { ServiceError } from "@packages/errors";

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

export class UsernameOrEmailAlreadyTakenError extends ServiceError {
    constructor(
        field: "username" | "email" | "both" = "both",
    ) {
        const errors: Record<string, string[]> = {};

        if (field === "username" || field === "both") {
            errors.username = ["Username is already taken"];
        }

        if (field === "email" || field === "both") {
            errors.email = ["Email is already registered"];
        }

        super(
            "Username or email is already taken",
            "USERNAME_OR_EMAIL_ALREADY_TAKEN",
            409,
            errors,
        );
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

export class TwoFANotInitError extends ServiceError {
    constructor() {
        super(
            "Two factor not initialized or secret is not set.",
            "2fa_not-initialized",
            400,

        );
    }
}