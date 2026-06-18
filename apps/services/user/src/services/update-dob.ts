import { UserRepo } from "@/repo/user-repo";
import { UsernameAlreadyTakenError, UserNotFoundError } from "@/errors/service-error";

export interface UpdateDOBServiceParams {
    userID: string;
    dateOfBirth: Date;
}

export class UpdateDOBService {
    constructor(
        private readonly userRepo: UserRepo
    ) { }

    async execute({
        userID,
        dateOfBirth
    }: UpdateDOBServiceParams): Promise<{ success: boolean }> {
        if (dateOfBirth) {
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
            dateOfBirth
        });

        return {
            success: true
        }
    }
}