import { Prisma } from "@prisma/client";

export interface ClientData {
  userDeviceName: string;
  userDeviceType: string;
  userDeviceID: string;
  userDeviceBrowser: string;
  userDeviceOS: string;
  userIPAddress: string;
}

export interface UserSession {
  userID: string;
  userSessionID: string;
  userDeviceName: string;
  userDeviceType: string;
  userDeviceBrowser: string;
  userDeviceOS: string;
  userIPAddress: string;
}


export interface UserSessionRefresh {
  refreshSessionToken: string,
  userID: string,
  userSessionID: string,
  userIPAddress: string
}

export const activeSessionSelect: Prisma.UserSessionSelect = {
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

export type ActiveSessionRecord =
  Prisma.UserSessionGetPayload<{ select: typeof activeSessionSelect }>;