import { prisma } from "@clients/prisma";
import { logger } from "@packages/shared/utils";
import { ServiceResponse, ServiceException } from "@packages/shared/utils";

/**
 * @service signoutService
 * Revokes a user's device session (signout) safely with logging and error handling.
 *
 * @param userID - ID of the user performing signout
 * @param userSessionID - ID of the specific device session to revoke
 * @returns ServiceResponse with revoked session info
 */
export const signoutService = async <T>(userID: string, userSessionID: string) => {
  try {
    logger.debug(`[SIGNOUT] Attempting to find active session for userID: ${userID}, sessionID: ${userSessionID}`);

    // Fetch Session from db
    let session;
    try {
      // Attempt to find the active session in DB
      session = await prisma.userSession.findFirst({
        where: { userID, userSessionID, revoked: false },
      });
    } catch (prismaErr) {
      logger.error({
        message: `[SIGNOUT] Prisma error finding session`,
        userID,
        userSessionID,
        error: prismaErr,
      });
      throw new ServiceException(
        ServiceResponse.error({
          success: false,
          statusCode: 500,
          message: "Database error while fetching session.",
          errorType: "db_error",
        })
      );
    }

    // No active session found
    if (!session) {
      logger.warn(`[SIGNOUT] No active session found for userID: ${userID}, sessionID: ${userSessionID}`);
      throw new ServiceException(
        ServiceResponse.error({
          success: false,
          statusCode: 404,
          message: "Session not found or already signed out.",
          errorType: "session_expired",
        })
      );
    }

    // Attempt to revoke the session
    try {
      await prisma.userSession.update({
        where: { userSessionID },
        data: { revoked: true, revokedAt: new Date() },
      });
    } catch (updateErr) {
      logger.error({
        message: `[SIGNOUT] Prisma error updating session`,
        userID,
        userSessionID,
        error: updateErr,
      });
      throw new ServiceException(
        ServiceResponse.error({
          success: false,
          statusCode: 500,
          message: "Database error while revoking session.",
          errorType: "db_error",
        })
      );
    }

    // Log successful revocation with device context
    logger.info({
      message: "[SIGNOUT] Session revoked successfully",
      userID,
      userSessionID,
      deviceName: session.userDeviceName,
      deviceId: session.userDeviceID,
      ipAddress: session.userIPAddress,
    });

    // Return structured success response
    return ServiceResponse.success<T>({
      success: true,
      statusCode: 200,
      message: "User signed out successfully (device session revoked).",
      data: {
        revokedSession: {
          userSessionID,
          deviceName: session.userDeviceName,
          deviceId: session.userDeviceID,
          ipAddress: session.userIPAddress,
        },
      } as T,
    });
  } catch (err: any) {
    // 6️⃣ Catch-all for unexpected errors
    logger.error({
      message: `❌ [SIGNOUT] Unexpected error signing out user ${userID}`,
      userID,
      userSessionID,
      error: err?.message || err,
    });

    if (err instanceof ServiceException) throw err;

    // Wrap unknown errors into ServiceException
    throw new ServiceException(
      ServiceResponse.error({
        success: false,
        statusCode: 500,
        message: err?.message || "Internal server error",
        errorType: "internal_server_error",
      })
    );
  }
};
