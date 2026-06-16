import speakeasy from "speakeasy";
import { AuthRepo } from "@/repo/auth-repo";
import {
    NotFoundError,
} from "@packages/errors";
import { InvalidCredentialsError } from "@/errors/service-error";

export interface Disable2FAServiceParams {
    userID: string;
    token: string;
}

export class Disable2FAService {

    constructor(private repo: AuthRepo) {}

    public async execute({
        userID,
        token,
    }: Disable2FAServiceParams): Promise<{success: boolean}> {

        const user =
            await this.repo.getUserWithUserID(userID);

        if (!user) throw new NotFoundError("User not found");

        if (!user.twoFactorSecret)
            throw new InvalidCredentialsError();

        const isValid = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: "base32",
            token,
            window: 1,
        });

        if (!isValid)
            throw new InvalidCredentialsError();

        await this.repo.disableTwoFactor(userID);

        return {
            success: true,
        };
    }
}
