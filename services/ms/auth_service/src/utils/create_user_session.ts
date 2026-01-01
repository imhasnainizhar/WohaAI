import argon2 from "argon2";
import { prisma } from "../clients/prisma";
import { logger } from "@utils/logger";
import { ClientData } from "@packages/shared/common/auth/types";
import { UserSession } from "@prisma/client";

/**
 * 
 * @param { 
 * userID: string;
 * clientData: ClientData;
 * refreshToken: string;
 * userSessionID?: string; 
 * }
 * @returns UserSession
 */
export const createUserSession = async (
  { userID,
    clientData,
    refreshToken,
    userSessionID,
  }: {
    userID: string;
    clientData: ClientData;
    refreshToken: string;
    userSessionID?: string;
  }): Promise<UserSession> => {
  try {
    const refreshTokenHash = await argon2.hash(refreshToken);

    if (!clientData.userIPAddress) {
      logger.warn("⚠️ [SESSION] Missing client IP — defaulting to 'unknown'");
    }

    const session = await prisma.userSession.create({
      data: {
        userSessionID: userSessionID ?? "Unknown",
        refreshTokenHash,
        userID,
        revoked: false,
        userIPAddress: clientData.userIPAddress ?? "Unknown",
        userDeviceID: `${clientData.userDeviceType ?? "Unknown"}-${crypto.randomUUID()}`,
        userDeviceName: clientData.userDeviceName ?? "Unknown Device",
        userDeviceType: clientData.userDeviceType ?? "Unknown",
        userDeviceBrowser: clientData.userDeviceBrowser ?? "Unknown",
        userDeviceOS: clientData.userDeviceOS ?? "Unknown",
      },
      include: {
        user: {
          select: {
            userID: true,
            email: true,
            userFirstName: true,
            userLastName: true,
          },
        },
      },
    });

    logger.debug({
      message: "✅ [SESSION] Created new user session",
      userID: userID,
      ip: clientData.userIPAddress,
      device: clientData.userDeviceName,
    });

    return session;

  } catch (err: any) {
    logger.error({
      message: "❌ [SESSION] Failed to generate user session through utility.",
      error: err.message || err,
    });

    throw new Error("Failed to generate user session through utility.");
  }
};
