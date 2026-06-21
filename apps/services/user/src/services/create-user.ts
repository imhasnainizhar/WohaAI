import { UserRepo } from "@/repo/user-repo";
import { EmailAlreadyTakenError, UsernameAlreadyTakenError } from '../errors/service-error';
import { userLogger } from "@wohaai/telemetry";

export interface CreateUserServiceParams {
    username: string;
    email: string;
    hashedPassword: string;
}

export interface CreateUserServiceResponse {
    userID: string;
    username: string;
    email: string;
}

export class CreateUserService {
    constructor(
        private readonly userRepo: UserRepo
    ) { }

    async execute({
        username,
        email,
        hashedPassword
    }: CreateUserServiceParams): Promise<CreateUserServiceResponse> {
        userLogger.debug("Creating user" + JSON.stringify({ username, email }));
        const existingEmail =
            await this.userRepo.getUserWithEmail(email);

        if (existingEmail) {
            throw new EmailAlreadyTakenError();
        }

        userLogger.debug("Email check passed" + JSON.stringify({ email }));

        const existingUsername =
            await this.userRepo.getUserWithUsername(username);

        if (existingUsername) {
            throw new UsernameAlreadyTakenError();
        }

        userLogger.debug("Username check passed" + JSON.stringify({ username }));

        userLogger.debug("Creating user in database");
        const createdUser = await this.userRepo.createUser({
            username,
            email,
            hashedPassword
        });

        userLogger.info("✅ User created successfully" + JSON.stringify({ username, email }));

        return {
            userID: createdUser.id,
            username: createdUser.username,
            email: createdUser.email
        }
    }
}