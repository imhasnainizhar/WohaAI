import { UserRepo } from "@/repo/user-repo";
import { UsernameAlreadyTakenError, UserNotFoundError } from "@/errors/service-error";

export interface UpdateProfilePicServiceParams {
    userID: string;
    profilePicURI: string;
}

export class UpdateProfilePicService {
    constructor(
        private readonly userRepo: UserRepo
    ) { }

    async execute({
        userID,
        profilePicURI,
    }: UpdateProfilePicServiceParams): Promise<{ success: boolean }> {
        if (profilePicURI) {
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
            profilePicURI,
        });

        return {
            success: true
        }
    }
}