import { User } from "@packages/models";

import {
    UpdateUserService,
    UpdateUserServiceParams
} from "./update-user";
import { CreateUserService, CreateUserServiceParams } from "./create-user";
import { GetMeService, GetMeServiceParams, GetMeServiceResponse } from "./get-me";
import { UserRepo } from "@/repo/user-repo";

export class UserService {
    private static instance: UserService;

    // Making constructor public for testing 
    constructor(
        private readonly createUserService: CreateUserService,
        private readonly updateUserService: UpdateUserService,
        private readonly getMeService: GetMeService
    ) { }

    public static getInstance(): UserService {
        if (!UserService.instance) {
            const userRepo = new UserRepo(User);

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
        id,
        firstName,
        lastName,
        username,
        dateOfBirth
    }: UpdateUserServiceParams) {
        return this.updateUserService.execute({
            id,
            firstName,
            lastName,
            username,
            dateOfBirth
        });
    }

    public async getMe({
        id
    }: GetMeServiceParams): Promise<GetMeServiceResponse> {
        return this.getMeService.execute({
            id
        })
    }
}

export const userService = UserService.getInstance();