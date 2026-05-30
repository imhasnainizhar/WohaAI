// prisma-service-error.ts
import {
    PrismaClientInitializationError,
    PrismaClientKnownRequestError,
    PrismaClientValidationError,
} from "@prisma/client/runtime/client";

import { ServiceError } from "./service-error";

export class PrismaError extends ServiceError {
    public readonly originalError: unknown;

    constructor(error: unknown) {
        const mapped = PrismaError.mapError(error);

        super(mapped.message, mapped.code, mapped.statusCode, mapped.meta);

        this.originalError = error;
        Object.setPrototypeOf(this, PrismaError.prototype);
    }

    private static mapError(error: unknown): {
        message: string;
        code: string;
        statusCode: number;
        meta?: Record<string, string[]>;
    } {
        if (error instanceof PrismaClientKnownRequestError) {
            switch (error.code) {
                case "P2002": {
                    const field =
                        (error.meta?.target as string[] | undefined)?.[0] ?? "field";

                    return {
                        message: "Unique constraint violated",
                        code: "unique_constraint_error",
                        statusCode: 409,
                        meta: {
                            [field]: ["Already exists"],
                        },
                    };
                }

                case "P2025":
                    return {
                        message: "Record not found",
                        code: "not_found",
                        statusCode: 404,
                        meta: {
                            resource: ["Not found"],
                        },
                    };

                case "P2003":
                    return {
                        message: "Invalid reference",
                        code: "foreign_key_error",
                        statusCode: 400,
                        meta: {
                            reference: ["Invalid relation"],
                        },
                    };

                default:
                    return {
                        message: "Database error",
                        code: "database_error",
                        statusCode: 500,
                    };
            }
        }

        if (error instanceof PrismaClientValidationError) {
            return {
                message: "Invalid query structure",
                code: "validation_error",
                statusCode: 400,
            };
        }

        if (error instanceof PrismaClientInitializationError) {
            return {
                message: "Database connection failed",
                code: "db_connection_error",
                statusCode: 503,
            };
        }

        return {
            message: "Unknown database error",
            code: "unknown_db_error",
            statusCode: 500,
        };
    }
}