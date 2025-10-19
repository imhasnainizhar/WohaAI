import { Request, Response } from "express";
import { z, ZodError } from "zod";
import { sendResponse } from "@utils/api_response";
import { getUserService } from "@services/getuser.service";
import { logger } from "@utils/logger";

// Zod schemas for route validation
const idParamsSchema = z.object({ id: z.string().uuid({ message: "Invalid user ID format" }) });
const usernameParamsSchema = z.object({ username: z.string().min(1, "Username is required") });

/**
 * Controller: Get user by ID or username
 */
export const getUserController = async (req: Request, res: Response) => {
  const path = req.path;

  try {
    logger.info({ message: "🟢 [USER] Incoming get user request", path });

    let result;
    if (req.params.id) {
      const { id } = idParamsSchema.parse(req.params);
      result = await getUserService({ userId: id });
    } else if (req.params.username) {
      const { username } = usernameParamsSchema.parse(req.params);
      result = await getUserService({ username });
    } else {
      return sendResponse({
        res,
        success: false,
        message: "Missing userId or username",
        statusCode: 400,
        errorType: "invalid_input",
        path,
      });
    }

    return sendResponse({ res, ...result, path });

  } catch (err: unknown) {
    if (err instanceof ZodError) {
      logger.warn({ message: "⚠️ [USER] Validation failed", path, issues: err.issues });

      const fieldErrors: Record<string, string[]> = {};
      err.issues.forEach((issue) => {
        const field = issue.path.join(".") || "unknown";
        if (!fieldErrors[field]) fieldErrors[field] = [];
        fieldErrors[field].push(issue.message);
      });

      return sendResponse({
        res,
        success: false,
        message: "Invalid request parameters",
        statusCode: 400,
        errors: fieldErrors,
        errorType: "validation_error",
        path,
      });
    }

    logger.error({ message: "❌ [USER] Unhandled error in getUserController", path, error: err });
    return sendResponse({
      res,
      success: false,
      message: "Internal server error",
      statusCode: 500,
      errorType: "internal_server_error",
      path,
    });
  }
};
