import {
    Request,
    Response,
    NextFunction,
} from "express";

import { authLogger } from "@wohaai/telemetry";
import { ServiceError } from "@wohaai/errors";
import { sendResponse } from "@wohaai/http";
import { ExpressAdapter } from "@wohaai/http";

export const errorHandler = (
    err: unknown,
    req: Request,
    res: Response,
    _next: NextFunction,
) => {
    // Known domain/application errors
    if (err instanceof ServiceError) {
        authLogger.debug({
            emoji: "⚠️",
            errorType: err.errorType,
            message: err.message,
            statusCode: err.statusCode,
            errors: err.errors,
            path: req.originalUrl,
            method: req.method,
            ip: req.ip,
        }, `[${err.errorType.toUpperCase()}] ${err.message}`);

        return sendResponse({
            res: new ExpressAdapter(res),
            success: false,
            statusCode: err.statusCode,
            message: err.message,
            errors: err.errors,
            errorType: err.errorType,
            path: req.originalUrl,
        });
    }

    // Unexpected/unhandled errors
    authLogger.error({
        emoji: "🚨",
        message: "Unhandled application error",
        path: req.originalUrl,
        method: req.method,
        ip: req.ip,
        error: err instanceof Error ? err.stack : String(err),
    }, "🚨 UNHANDLED ERROR");

    return sendResponse({
        res: new ExpressAdapter(res),
        success: false,
        statusCode: 500,
        message: "Internal server error",
        errorType: "internal_server_error",
        path: req.originalUrl,
    });
};