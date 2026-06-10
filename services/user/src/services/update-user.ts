import { UserRepo } from "@/repo/user-repo";
import { UsernameAlreadyTakenError } from "@/errors/service-error";

export interface UpdateUserServiceParams {
    id: string;
    firstName?: string;
    lastName?: string;
    username?: string;
    dateOfBirth?: Date;
}

export class UpdateUserService {
    constructor(
        private readonly userRepo: UserRepo
    ) { }

    async execute({
        id,
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
                existingUser.id !== id
            ) {
                throw new UsernameAlreadyTakenError();
            }
        }

        await this.userRepo.updateUser({
            id,
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