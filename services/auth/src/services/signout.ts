import { logger } from "@packages/observability";
import { SignoutResponse } from "@packages/contracts/auth";
import { AuthRepo } from "@/repo/auth-repo";
import { SessionExpiredError } from "@packages/errors";
import { SignoutParams } from "@/types/service/params";

export class SignoutService {
  constructor(private authRepo: AuthRepo) { }

  /**
   * Main signout orchestration
   */
  public async execute({
    userID,
    userSessionID
  }: SignoutParams): Promise<SignoutResponse> {
    const session = await this.authRepo.findActiveSession({
      userID,
      userSessionID
    });

    if(session === null) throw new SessionExpiredError

    await this.authRepo.revokeSession(userSessionID);

    logger.debug({
      message:
        "[SIGNOUT] Session revoked successfully",
      userID,
      userSessionID,
      deviceName: session.userDeviceName,
      deviceId: session.userDeviceID,
      ipAddress: session.userIPAddress,
    });

    return { signedOut: true };
  }
}