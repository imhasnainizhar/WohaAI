import { userPrisma, UserPrismaClient } from "@packages/prisma-users";
import { UserRepo } from "@/repo/user-repo";

import {
    UpdateUserService,
    UpdateUserServiceParams
} from "./update-user";
import { CreateUserService, CreateUserServiceParams } from "./create-user";
import { GetMeService, GetMeServiceParams, GetMeServiceResponse } from "./get-me";

class UserService {
    private static instance: UserService;

    private constructor(
        private readonly createUserService: CreateUserService,
        private readonly updateUserService: UpdateUserService,
        private readonly getMeService: GetMeService
    ) { }

    public static getInstance(): UserService {
        if (!UserService.instance) {
            const userRepo = new UserRepo(userPrisma);

            const createUserService =
                new CreateUserService(userRepo)

            const updateUserService =
                new UpdateUserService(userRepo)

            const getMeService =
                new GetMeService(userRepo)

            UserService.instance = new UserService(
                createUserService,
                updateUserService,
                getMeService
            );
        }

        return UserService.instance;
    }

    public async createUser({
        firstName,
        lastName,
        username,
        email,
        hashedPassword,
        dateOfBirth
    }: CreateUserServiceParams) {
        return this.createUserService.execute({
            firstName,
            lastName,
            username,
            email,
            hashedPassword,
            dateOfBirth
        })
    }
    public async updateUser({
        userID,
        firstName,
        lastName,
        username,
        dateOfBirth
    }: UpdateUserServiceParams) {
        return this.updateUserService.execute({
            userID,
            firstName,
            lastName,
            username,
            dateOfBirth
        });
    }

    public async getMe({
        userID
    }: GetMeServiceParams): Promise<GetMeServiceResponse> {
        return this.getMeService.execute({
            userID
        })
    }
}

export const userService = UserService.getInstance();