import { authLogger } from "@packages/observability";
import { AuthRepo } from "@/repo/auth-repo";
import { SessionExpiredError } from "@packages/errors";


export interface SignoutServiceParams {
  userID: string;
  userSessionID: string;
}

export interface SignoutServiceResponse {
  signedOut: boolean
}

export class SignoutService {
  constructor(private authRepo: AuthRepo) { }

  /**
   * Main signout orchestration
   */
  public async execute({
    userID,
    userSessionID
  }: SignoutServiceParams): Promise<SignoutServiceResponse> {
    const session = await this.authRepo.findActiveSession({
      userID,
      userSessionID
    });

    if(session === null) throw new SessionExpiredError

    await this.authRepo.revokeSession(userSessionID);

    authLogger.debug({
      message:
        "[SIGNOUT] Session revoked successfully",
      userID,
      userSessionID,
      deviceName: session.userDeviceName,
      ipAddress: session.userIPAddress,
    });

    return { signedOut: true };
  }
}