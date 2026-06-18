import { UserRepo } from "@/repo/user-repo";
import { EmailAlreadyTakenError, UsernameAlreadyTakenError } from '../errors/service-error';

export interface CreateUserServiceParams {
    username: string;
    email: string;
    hashedPassword: string;
}

export class CreateUserService {
    constructor(
        private readonly userRepo: UserRepo
    ) {}

    async execute({
        username,
        email,
        hashedPassword
    }: CreateUserServiceParams): Promise<{userCreated: boolean}> {
        const existingEmail =
            await this.userRepo.getUserWithEmail(email);

        if (existingEmail) {
            throw new EmailAlreadyTakenError();
        }

        const existingUsername =
            await this.userRepo.getUserWithUsername(username);

        if (existingUsername) {
            throw new UsernameAlreadyTakenError();
        }

        await this.userRepo.createUser({
            username,
            email,
            hashedPassword
        });

        return {
          userCreated: true
        }
    }
}