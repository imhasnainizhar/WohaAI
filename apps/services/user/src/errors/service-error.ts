import { ServiceError } from "@wohaai/errors";

export class UsernameAlreadyTakenError extends ServiceError {
    constructor(

    ) {
        const errors: Record<string, string[]> = {};
        errors.email = ["Username is already registered"];

        super(
            "Username is already taken",
            "USERNAME_ALREADY_TAKEN",
            409,
            errors,
        );
    }
}

export class EmailAlreadyTakenError extends ServiceError {
    constructor(

    ) {
        const errors: Record<string, string[]> = {};
        errors.email = ["Email is already registered"];

        super(
            "Email is already taken",
            "EMAIL_ALREADY_TAKEN",
            409,
            errors,
        );
    }
}

export class UserNotFoundError extends ServiceError {
    constructor() {
        super(
            "User not found",
            "USER_NOT_FOUND",
            404
        );
    }
}