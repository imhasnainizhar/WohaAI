import speakeasy from "speakeasy";
import { AuthRepo } from "@/repo/auth-repo";
import {
    NotFoundError,
} from "@wohaai/errors";
import { InvalidCredentialsError } from "@/errors/service-error";

export interface Verify2FAServiceParams {
    userID: string;
    token: string;
}

export class Verify2FAService {

    constructor(private repo: AuthRepo) { }

    public async execute({
        userID,
        token,
    }: Verify2FAServiceParams): Promise<{ success: boolean }> {

        const user =
            await this.repo.getUserWithUserID(userID);

        if (!user) throw new NotFoundError("User not found");

        if (
            !user.twoFactorEnabled ||
            !user.twoFactorSecret
        ) {
            throw new InvalidCredentialsError();
        }

        const isValid = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: "base32",
            token,
            window: 1,
        });

        if (!isValid)
            throw new InvalidCredentialsError();

        return {
            success: true,
        };
    }
}