import { z } from "zod";
import { prisma } from "@utils/prisma_client";
import argon2 from "argon2";
import { sendResponse } from "@utils/api_response";
import { Response, Request } from "express";
import { passwordUpdateSchema } from "@schemas/password_update.schema";

export const updateUserService = async (req: Request, res: Response) => {
    try {
        const data = req.body
        // ✅ Validate input here
        const validated = updateUserSchema.parse(data);

        // 🧠 Business Logic (hash password, update user)
        const hashedPassword = await argon2.hash(validated.newPassword);

        const updatedUser = await prisma.user.update({
            where: { id: data.userID },
            data: {
                username: validated.username,
                firstName: validated.firstName,
                lastName: validated.lastName,
                password: hashedPassword,
            },
        });

        return updatedUser;
    } catch (err: unknown) {
        if (err instanceof z.ZodError) {
            const formattedErrors: Record<string, string[]> = {};

            err.issues.forEach((issue) => {
                const field = issue.path.join(".") || "general";
                if (!formattedErrors[field]) formattedErrors[field] = [];
                formattedErrors[field].push(issue.message);
            });

            return sendResponse({
                res,
                success: false,
                message: "Validation failed",
                statusCode: 400,
                errorType: "validation_error",
                errors: formattedErrors,
                path: req.originalUrl,
            });
        }
    }

};
