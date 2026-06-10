import { authLogger } from "@packages/observability";
import { AuthRepo } from "@/repo/auth-repo";
import { SessionExpiredError } from "@packages/errors";


export interface SignoutServiceParams {
  id: string;
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
    id,
    userSessionID
  }: SignoutServiceParams): Promise<SignoutServiceResponse> {
    const session = await this.authRepo.findActiveSession({
      id,
      userSessionID
    });

    if (session === null) throw new SessionExpiredError

    await this.authRepo.revokeSession(userSessionID);

    authLogger.debug({
      message:
        "[SIGNOUT] Session revoked successfully",
      id,
      userSessionID,
      deviceName: session.userDeviceName,
      ipAddress: session.userIPAddress,
    });

    return { signedOut: true };
  }
}