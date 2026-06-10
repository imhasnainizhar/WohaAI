import { UserRepo } from "@/repo/user-repo";
import { EmailAlreadyTakenError, UsernameAlreadyTakenError } from '../errors/service-error';

export interface CreateUserServiceParams {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    hashedPassword: string;
    dateOfBirth?: Date;
}

export class CreateUserService {
    constructor(
        private readonly userRepo: UserRepo
    ) {}

    async execute({
        firstName,
        lastName,
        username,
        email,
        hashedPassword,
        dateOfBirth
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
            firstName,
            lastName,
            username,
            email,
            hashedPassword,
            dateOfBirth
        });

        return {
          userCreated: true
        }
    }
}