import mongoose from "mongoose";
import { ServiceError } from "./service-error";


const isConnectionError = (error: unknown) => {
  return (
    error instanceof mongoose.MongooseError ||
    (error as any)?.name === "MongooseServerSelectionError" ||
    (error as any)?.name === "MongoNetworkError"
  );
};

export class MongooseError extends ServiceError {
  public readonly originalError: unknown;

  constructor(error: unknown) {
    const mapped = MongooseError.mapError(error);

    super(mapped.message, mapped.code, mapped.statusCode, mapped.meta);

    this.originalError = error;
    Object.setPrototypeOf(this, MongooseError.prototype);
  }

  private static mapError(error: unknown): {
    message: string;
    code: string;
    statusCode: number;
    meta?: Record<string, string[]>;
  } {
    // Duplicate key error
    if ((error as any)?.code === 11000) {
      const err = error as any;

      const field = Object.keys(err.keyPattern || {})[0] || "field";

      return {
        message: "Unique constraint violated",
        code: "unique_constraint_error",
        statusCode: 409,
        meta: {
          [field]: ["Already exists"],
        },
      };
    }

    // Validation Error (schema)
    if (error instanceof mongoose.Error.ValidationError) {
      const meta: Record<string, string[]> = {};

      for (const field in error.errors) {
        meta[field] = [error.errors[field].message];
      }

      return {
        message: "Validation failed",
        code: "validation_error",
        statusCode: 400,
        meta,
      };
    }

    // Invalid ObjectId / CastError
    if (error instanceof mongoose.Error.CastError) {
      return {
        message: "Invalid ID format",
        code: "invalid_object_id",
        statusCode: 400,
        meta: {
          [error.path]: ["Invalid identifier format"],
        },
      };
    }
    
    // Connection / initialization errors
    if (isConnectionError(error)) {
      return {
        message: "Database connection failed",
        code: "db_connection_error",
        statusCode: 503,
      };
    }
    
    // Generic fallback
    return {
      message: "Unknown database error",
      code: "unknown_db_error",
      statusCode: 500,
    };
  }
}