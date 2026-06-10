import type { Prisma } from "@packages/prisma-users";

// Interface for user session refresh
export interface UserSessionRefresh {
  refreshSessionToken: string,
  id: string,
  userSessionID: string,
  userIPAddress: string
}

// Selecting fields from UserSession
// To get active session record from DB
export const ActiveSessionSelect: Prisma.UserSessionSelect = {
  refreshTokenHash: true,
  userSessionID: true,
  userIPAddress: true,
  revoked: true,
  createdAt: true,
  user: {
    select: {
      id: true,
      username: true,
      email: true,
      firstName: true,
      lastName: true,
    },
  },
};

// Type for active session record
export type ActiveSessionRecord =
  Prisma.UserSessionGetPayload<{ select: typeof ActiveSessionSelect }>;