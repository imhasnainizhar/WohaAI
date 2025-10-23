import argon2 from "argon2";
import { prisma } from "@utils/prisma_client";
import { logger } from "@utils/logger";
import { ClientData, UserSession } from "@custom_types/user_session.types";
import { ServiceResponse } from "@utils/response";

export const createUserSession = async (
  userID: string,
  clientData: ClientData,
  refreshToken: string,
  rememberMe: Boolean,
): Promise<UserSession> => {
  try {
    const refreshTokenHash = await argon2.hash(refreshToken);

    if (!clientData.userIPAddress) {
      logger.warn("⚠️ [SESSION] Missing client IP — defaulting to 'unknown'");
    }

    const session = await prisma.userSession.create({
      data: {
        refreshTokenHash,
        userID,
        revoked: false,
        userIPAddress: clientData.userIPAddress ?? "unknown",
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
      message: "❌ [SESSION] Failed to create user session",
      error: err.message || err,
    });

    throw new Error("Failed to create user session in database.");
  }
};
