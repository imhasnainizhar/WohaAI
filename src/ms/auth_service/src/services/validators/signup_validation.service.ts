import { logger } from "@utils/logger";
import { ServiceException } from "@errors/service_exception";
import { ServiceResponse } from "@utils/service_response";
import { prisma } from "@utils/prisma_client";
import { randomUUID } from "crypto";
import { setCache, getCache } from "@utils/redis_client";
import {
  usernameSchema,
  displayNameSchema,
  emailSchema,
  passwordSchema,
} from "@schemas/signup_validation.schema";

const TOKEN_TTL = 1800; // 30 minutes

// Step 1: Validate Username
export const validateUsername = async (username: string) => {
  const parsed = usernameSchema.safeParse(username.trim());
  if (!parsed.success) throwValidationError(parsed.error, "username");

  const existingUser = await prisma.user.findUnique({ where: { username: parsed.data }, select: { id: true } });
  if (existingUser) throwConflictError("username", "This username is already in use.");

  const token = randomUUID();

  // Store initial validated username as temp user
  const tempUser = { username: parsed.data };
  await setCache(`pending_signup:${token}`, JSON.stringify(tempUser), TOKEN_TTL);

  return ServiceResponse.success({
    success: true,
    statusCode: 200,
    message: "Username is available.",
    data: { token },
  });
};

// Step 2: Validate Display Name
export const validateDisplayName = async (token: string, firstName: string, lastName: string, username: string) => {
  const pending = await getPending(token);

  // Ensure username matches previous validated value
  if (pending.username !== username) throwStepMismatch("username");

  const parsed = displayNameSchema.safeParse({ firstName: firstName.trim(), lastName: lastName.trim() });
  if (!parsed.success) throwValidationError(parsed.error, "displayName");

  // If previously stored values exist, they must match
  if ((pending.firstName && pending.firstName !== parsed.data?.firstName) ||
      (pending.lastName && pending.lastName !== parsed.data?.lastName)) {
    throwStepMismatch("displayName");
  }

  pending.firstName = parsed.data?.firstName;
  pending.lastName = parsed.data?.lastName;
  await setCache(`pending_signup:${token}`, JSON.stringify(pending), TOKEN_TTL);

  return ServiceResponse.success({
    success: true,
    statusCode: 200,
    message: "Display name is valid.",
    data: parsed.data,
  });
};

// Step 3: Validate Email
export const validateEmail = async (token: string, email: string, username: string, firstName: string, lastName: string) => {
  const pending = await getPending(token);

  // Ensure previous fields match
  if (pending.username !== username) throwStepMismatch("username");
  if (pending.firstName !== firstName || pending.lastName !== lastName) throwStepMismatch("displayName");

  const parsed = emailSchema.safeParse(email.trim());
  if (!parsed.success) throwValidationError(parsed.error, "email");

  const existingEmail = await prisma.user.findUnique({ where: { email: parsed.data }, select: { id: true } });
  if (existingEmail) throwConflictError("email", "This email is already associated with an account.");

  // Ensure email hasn't been tampered with if previously stored
  if (pending.email && pending.email !== parsed.data) throwStepMismatch("email");

  pending.email = parsed.data;
  await setCache(`pending_signup:${token}`, JSON.stringify(pending), TOKEN_TTL);

  return ServiceResponse.success({
    success: true,
    statusCode: 200,
    message: "Email is valid.",
    data: { token },
  });
};

// Step 4: Validate Password
export const validatePassword = async (token: string, password: string, confirmPassword: string, username: string, firstName: string, lastName: string, email: string) => {
  const pending = await getPending(token);

  // Ensure all previous fields match
  if (pending.username !== username) throwStepMismatch("username");
  if (pending.firstName !== firstName || pending.lastName !== lastName) throwStepMismatch("displayName");
  if (pending.email !== email) throwStepMismatch("email");

  const parsed = passwordSchema.safeParse({ password, confirmPassword });
  if (!parsed.success) throwValidationError(parsed.error, "password");

  pending.password = parsed.data?.password;
  await setCache(`pending_signup:${token}`, JSON.stringify(pending), TOKEN_TTL);

  return ServiceResponse.success({
    success: true,
    statusCode: 200,
    message: "Password is valid.",
    data: parsed.data,
  });
};

/** ===== Helper Functions ===== **/
const getPending = async (token: string) => {
  const pendingStr = await getCache(`pending_signup:${token}`);
  if (!pendingStr) throwTokenExpired();
  return JSON.parse(pendingStr!);
};

const throwValidationError = (error: any, field: string) => {
  logger.debug({ message: `${field} validation failed`, issues: error.issues });
  throw new ServiceException(ServiceResponse.error({
    success: false,
    statusCode: 400,
    message: `Invalid ${field}.`,
    errorType: "validation_error",
    errors: error.flatten().fieldErrors,
  }));
};

const throwConflictError = (field: string, message: string) => {
  throw new ServiceException(ServiceResponse.error({
    success: false,
    statusCode: 409,
    message,
    errorType: "conflict_error",
    errors: { [field]: [message] },
  }));
};

const throwStepNotCompleted = () => {
  throw new ServiceException(ServiceResponse.error({
    success: false,
    statusCode: 400,
    message: "Previous steps not completed.",
    errorType: "validation_error",
  }));
};

const throwStepMismatch = (field: string) => {
  throw new ServiceException(ServiceResponse.error({
    success: false,
    statusCode: 400,
    message: `${field} does not match previously validated value.`,
    errorType: "validation_error",
  }));
};

const throwTokenExpired = () => {
  throw new ServiceException(ServiceResponse.error({
    success: false,
    statusCode: 400,
    message: "Invalid or expired token.",
    errorType: "validation_error",
  }));
};
