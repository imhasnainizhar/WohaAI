import { UserRepo } from "@/repo/user-repo";
import { UsernameAlreadyTakenError } from "@/errors/service-error";

export interface UpdateUserServiceParams {
    userID: string;
    firstName?: string;
    lastName?: string;
    username?: string;
    dateOfBirth?: Date | null;
}

export class UpdateUserService {
    constructor(
        private readonly userRepo: UserRepo
    ) { }

    async execute({
        userID,
        firstName,
        lastName,
        username,
        dateOfBirth
    }: UpdateUserServiceParams): Promise<{ userUpdated: boolean }> {
        if (username) {
            const existingUser =
                await this.userRepo.getUserWithUsername(username);

            if (
                existingUser &&
                existingUser.userID !== userID
            ) {
                throw new UsernameAlreadyTakenError();
            }
        }

        await this.userRepo.updateUser({
            userID,
            firstName,
            lastName,
            username,
            dateOfBirth
        });

        return {
            userUpdated: true
        }
    }
}