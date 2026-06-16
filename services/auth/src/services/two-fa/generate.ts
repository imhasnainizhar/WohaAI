import speakeasy from "speakeasy";
import { AuthRepo } from "@/repo/auth-repo";
import { NotFoundError } from "@packages/errors";

export interface Generate2FASecretServiceParams {
    userID: string;
}

export interface Generate2FASecretServiceResponse {
    secret: string;
    otpauthURL: string;
}

export class Generate2FASecretService {

    constructor(private repo: AuthRepo) {}

    public async execute({
        userID,
    }: Generate2FASecretServiceParams): Promise<Generate2FASecretServiceResponse> {

        const user =
            await this.repo.getUserWithUserID(userID);

        if (!user) throw new NotFoundError("User not found");

        const secret = speakeasy.generateSecret({
            name: `WohaAI (${user.email})`,
            issuer: "WohaAI",
            length: 32,
        });

        await this.repo.saveTwoFactorSecret({
            userID,
            secret: secret.base32,
        });

        return {
            secret: secret.base32,
            otpauthURL: secret.otpauth_url!,
        };
    }
}