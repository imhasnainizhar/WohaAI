import argon2 from "argon2";
import { AuthRepo } from '@/repo/auth-repo';
import { InvalidCredentialsError } from "@/errors/service-error";

export interface ChangePasswordServiceParams {
    userID: string;
    oldPassword: string;
    newPassword: string;
}

export interface ChangePasswordServiceResponse {
    passwordChanged: boolean;
}

export class ChangePasswordService {

    constructor(private repo: AuthRepo) { }

    /**
     * Main signin business logic
     */
    public async execute({
        userID,
        oldPassword,
        newPassword,
    }: ChangePasswordServiceParams): Promise<ChangePasswordServiceResponse> {
        const user =
            await this.repo.getUserWithUserID(userID);

        if (user === null) throw new InvalidCredentialsError()

        const isPasswordCorrect = await argon2.verify(
            user.hashedPassword,
            oldPassword
        );

        if (!isPasswordCorrect) throw new InvalidCredentialsError()

        const hashedPassword = await argon2.hash(newPassword)

        const _ = await this.repo.changeUserPassword({
            userID,
            hashedPassword
        })

        return {
            passwordChanged: true
        }
    }

}