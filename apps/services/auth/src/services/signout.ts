import { authLogger } from "@wohaai/telemetry";
import { AuthRepo } from "@/repo/auth-repo";
import { SessionExpiredError } from "@wohaai/errors";


export interface SignoutServiceParams {
  userID: string;
  userSessionID: string;
}

export class SignoutService {
  constructor(private authRepo: AuthRepo) { }

  /**
   * Main signout orchestration
   */
  public async execute({
    userID,
    userSessionID
  }: SignoutServiceParams): Promise<{ success: boolean }> {
    const session = await this.authRepo.findActiveSession({
      userID,
      userSessionID
    });

    if (session === null) throw new SessionExpiredError

    await this.authRepo.revokeSession(userSessionID);

    authLogger.debug({
      message:
        "[SIGNOUT] Session revoked successfully",
      userID,
      userSessionID,
      deviceName: session.userDeviceName,
      ipAddress: session.userIPAddress,
    });

    return { success: true };
  }
}