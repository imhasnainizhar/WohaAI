import { UserRepo } from "@/repo/user-repo";
import { UsernameAlreadyTakenError, UserNotFoundError } from "@/errors/service-error";

export interface UpdateFullNameServiceParams {
    userID: string;
    fullName: string;
}

export class UpdateFullNameService {
    constructor(
        private readonly userRepo: UserRepo
    ) { }

    async execute({
        userID,
        fullName,
    }: UpdateFullNameServiceParams): Promise<{ success: boolean }> {
        if (fullName) {
            const existingUser =
                await this.userRepo.getUserWithUserID(userID);

            if (
                !existingUser
            ) {
                throw new UserNotFoundError();
            }
        }

        await this.userRepo.updateUser({
            userID,
            fullName,
        });

        return {
            success: true
        }
    }
}