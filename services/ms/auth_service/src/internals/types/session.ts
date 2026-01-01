import { Prisma } from "@prisma/client";

// Interface for user session refresh
export interface UserSessionRefresh {
  refreshSessionToken: string,
  userID: string,
  userSessionID: string,
  userIPAddress: string
}

// Selecting fields from UserSession
// To get active session record from DB
export const ActiveSessionSelect: Prisma.UserSessionSelect = {
  refreshTokenHash: true,
  userSessionID: true,
  userDeviceID: true,
  userIPAddress: true,
  revoked: true,
  createdAt: true,
  user: {
    select: {
      userID: true,
      email: true,
      userFirstName: true,
      userLastName: true,
    },
  },
};

// Type for active session record
export type ActiveSessionRecord =
  Prisma.UserSessionGetPayload<{ select: typeof ActiveSessionSelect }>;