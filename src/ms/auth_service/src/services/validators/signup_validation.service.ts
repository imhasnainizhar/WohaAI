import { logger } from "@utils/logger";
import { ServiceException } from "@errors/service_exception";
import { ServiceResponse } from "@utils/service_response";
import { prisma } from "@utils/prisma_client";
import {
  usernameSchema,
  displayNameSchema,
  emailSchema,
  passwordSchema,
  UserName,
  DisplayName,
  Email,
  Password,
} from "@schemas/signup_validation.schema";

/**
 * Validate username format + check availability in DB
 */
export const validateUsername = async (username: string): Promise<ServiceResponse<UserName>> => {
  const parsed = usernameSchema.safeParse(username);
  if (!parsed.success) {
    logger.debug({ message: "Username validation failed", issues: parsed.error.issues });
    throw new ServiceException(
      ServiceResponse.error({
        success: false,
        statusCode: 400,
        message: "Invalid username format.",
        errorType: "validation_error",
        errors: parsed.error.flatten().fieldErrors,
      })
    );
  }

  // Check database for existing username
  const existingUser = await prisma.user.findUnique({
    where: { username: parsed.data },
    select: { id: true },
  });

  if (existingUser) {
    throw new ServiceException(
      ServiceResponse.error({
        success: false,
        statusCode: 409,
        message: "Username is already taken.",
        errorType: "conflict_error",
        errors: { username: ["This username is already in use."] },
      })
    );
  }

  return ServiceResponse.success({
    success: true,
    statusCode: 200,
    message: "Username is available.",
    data: parsed.data,
  });
};

/**
 * Validate display name format only (no DB check)
 */
export const validateDisplayName = (displayName: string): ServiceResponse<DisplayName> => {
  const parsed = displayNameSchema.safeParse(displayName);
  if (!parsed.success) {
    logger.debug({ message: "Display name validation failed", issues: parsed.error.issues });
    throw new ServiceException(
      ServiceResponse.error({
        success: false,
        statusCode: 400,
        message: "Invalid display name.",
        errorType: "validation_error",
        errors: parsed.error.flatten().fieldErrors,
      })
    );
  }

  return ServiceResponse.success({
    success: true,
    statusCode: 200,
    message: "Display name is valid.",
    data: parsed.data,
  });
};

/**
 * Validate email format + check if already registered in DB
 */
export const validateEmail = async (email: string): Promise<ServiceResponse<Email>> => {
  const parsed = emailSchema.safeParse(email);
  if (!parsed.success) {
    logger.debug({ message: "Email validation failed", issues: parsed.error.issues });

    throw new ServiceException(
      ServiceResponse.error({
        success: false,
        statusCode: 400,
        message: "Invalid email address.",
        errorType: "validation_error",
        errors: parsed.error.flatten().fieldErrors,
      })
    );
  }

  // Check if email already exists
  const existingEmail = await prisma.user.findUnique({
    where: { email: parsed.data },
    select: { id: true },
  });

  if (existingEmail) {
    throw new ServiceException(
      ServiceResponse.error({
        success: false,
        statusCode: 409,
        message: "Email is already registered.",
        errorType: "conflict_error",
        errors: { email: ["This email is already associated with an account."] },
      })
    );
  }

  return ServiceResponse.success({
    success: true,
    statusCode: 200,
    message: "Email is available.",
    data: parsed.data,
  });
};

/**
 * Validate password strength
 */
export const validatePassword = (password: string): ServiceResponse<Password> => {
  const parsed = passwordSchema.safeParse(password);
  if (!parsed.success) {
    logger.debug({ message: "Password validation failed", issues: parsed.error.issues });

    throw new ServiceException(
      ServiceResponse.error({
        success: false,
        statusCode: 400,
        message: "Invalid password format.",
        errorType: "validation_error",
        errors: parsed.error.flatten().fieldErrors,
      })
    );
  }

  return ServiceResponse.success({
    success: true,
    statusCode: 200,
    message: "Password is valid.",
    data: parsed.data,
  });
};
