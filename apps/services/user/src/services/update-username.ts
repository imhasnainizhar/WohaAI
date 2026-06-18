import { UserRepo } from "@/repo/user-repo";
import { UsernameAlreadyTakenError } from "@/errors/service-error";

export interface UpdateUsernameServiceParams {
    userID: string;
    username: string;
}

export class UpdateUsernameService {
    constructor(
        private readonly userRepo: UserRepo
    ) { }

    async execute({
        userID,
        username,
    }: UpdateUsernameServiceParams): Promise<{ success: boolean }> {
        if (username) {
            const existingUser =
                await this.userRepo.getUserWithUsername(username);

            if (
                existingUser &&
                existingUser.id !== userID
            ) {
                throw new UsernameAlreadyTakenError();
            }
        }

        await this.userRepo.updateUser({
            userID,
            username,
        });

        return {
            success: true
        }
    }
}