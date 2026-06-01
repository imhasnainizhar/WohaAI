import speakeasy from "speakeasy";
import { AuthRepo } from "@/repo/auth-repo";
import {
    NotFoundError,
} from "@packages/errors";
import { InvalidCredentialsError } from "@/errors/service-error";

export interface Verify2FAServiceParams {
    userID: string;
    token: string;
}

export interface Verify2FAServiceResponse {
    verified: boolean;
}

export class Verify2FAService {

    constructor(private repo: AuthRepo) {}

    public async execute({
        userID,
        token,
    }: Verify2FAServiceParams): Promise<Verify2FAServiceResponse> {

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
            verified: true,
        };
    }
}