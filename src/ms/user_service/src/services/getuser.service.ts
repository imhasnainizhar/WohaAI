import { prisma } from "@utils/prisma_client";

// Custom domain errors
export class UserNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UserNotFoundError";
  }
}

export class InvalidInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidInputError";
  }
}

// User type (sanitized for API output)
export interface UserRecord {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
  updatedAt: Date;
}

// Sanitize function to remove sensitive info
// Helps to keep private fields internal not to get out.
export const sanitizeUser = (user: any): UserRecord => ({
  id: user.id,
  email: user.email,
  username: user.username,
  firstName: user.firstName,
  lastName: user.lastName,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

// Service to get user by ID
export const getUserByIdService = async (userId: string): Promise<UserRecord> => {
  if (!userId) throw new InvalidInputError("User ID is required");

  const rawUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!rawUser) {
    throw new UserNotFoundError(`User not found with ID: ${userId}`);
  }

  return sanitizeUser(rawUser);
};

export const getUserByUsernameService = async (username: string): Promise<UserRecord> => {
  if (!username) throw new InvalidInputError("Username is required");

  const rawUser = await prisma.user.findUnique({
    where: { username },
  });

  if (!rawUser) {
    throw new UserNotFoundError(`User not found with username: ${username}`);
  }

  return sanitizeUser(rawUser);
};