import { Request, Response } from "express";
import { createUserService } from "@services/createuser.service";
import { sendResponse } from "@utils/api_response";
import { logger } from "@utils/logger";
import { z } from "zod";

// Zod schema for input validation
const createUserSchema = z.object({
    email: z.string().email("Invalid email"),
    hashedPassword: z.string(),
    firstName: z.string().min(1, "Display name is required"),
    lastName: z.string().min(1, "Display name is required"),
    username: z.string().min(3, "Username must be at least 3 characters"),
});

export const createUserController = async (req: Request, res: Response) => {
    try {
        // Validate input
        const parsed = createUserSchema.safeParse(req.body);
        if (!parsed.success) {
            const formattedErrors: Record<string, string[]> = {};
            parsed.error.issues.forEach((err) => {
                if (!err.path[0]) return;
                const key = err.path[0] as string;
                formattedErrors[key] = formattedErrors[key] || [];
                formattedErrors[key].push(err.message);
            });

            return sendResponse({
                res,
                success: false,
                statusCode: 400,
                message: "Validation failed",
                errors: formattedErrors,
                path: req.path,
            });
        }

        // Call service
        const serviceResult = await createUserService(parsed.data);

        // ptionally set auth cookies
        const { tokens } = serviceResult.data;
        res.cookie("accessToken", tokens.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: tokens.accessExp * 1000,
        });
        res.cookie("refreshToken", tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: tokens.refreshExp * 1000,
        });

        // Send response
        return sendResponse({
            res,
            ...serviceResult,
            path: req.path,
        });
    } catch (err: any) {
        logger.error("❌ createUserController error:", err);

        return sendResponse({
            res,
            success: false,
            statusCode: 500,
            message: "Failed to create user",
            errorType: "internal_server_error",
            path: req.path,
        });
    }
};
