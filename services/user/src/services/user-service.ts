import { User } from "@packages/models";

import {
    UpdateFullNameService,
    UpdateFullNameServiceParams
} from "./update-name";
import { UpdateDOBService, UpdateDOBServiceParams } from "./update-dob";
import { UpdateProfilePicService, UpdateProfilePicServiceParams } from "./update-profile-pic";
import { CreateUserService, CreateUserServiceParams } from "./create-user";
import { GetMeService, GetMeServiceParams, GetMeServiceResponse } from "./get-me";
import { UserRepo } from "@/repo/user-repo";
import { UpdateUsernameService, UpdateUsernameServiceParams } from './update-username';

export class UserService {
    private static instance: UserService;

    // Making constructor public for testing 
    constructor(
        private readonly createUserService: CreateUserService,
        private readonly updateFullNameService: UpdateFullNameService,
        private readonly updateDOBService: UpdateDOBService,
        private readonly updateProfilePicService: UpdateProfilePicService,
        private readonly updateUsernameService: UpdateUsernameService,
        private readonly getMeService: GetMeService
    ) { }

    public static getInstance(): UserService {
        if (!UserService.instance) {
            const userRepo = new UserRepo(User);

            const createUserService =
                new CreateUserService(userRepo)

            const updateFullNameService =
                new UpdateFullNameService(userRepo)

            const updateDOBService =
                new UpdateDOBService(userRepo)

            const updateProfilePicService =
                new UpdateProfilePicService(userRepo)

            const updateUsernameService =
                new UpdateUsernameService(userRepo)

            const getMeService =
                new GetMeService(userRepo)

            UserService.instance = new UserService(
                createUserService,
                updateFullNameService,
                updateDOBService,
                updateProfilePicService,
                updateUsernameService,
                getMeService
            );
        }

        return UserService.instance;
    }

    public async createUser({
        username,
        email,
        hashedPassword
    }: CreateUserServiceParams) {
        return this.createUserService.execute({
            username,
            email,
            hashedPassword
        })
    }
    public async updateFullName({
        userID,
        fullName
    }: UpdateFullNameServiceParams) {
        return this.updateFullNameService.execute({
            userID,
            fullName
        });
    }

    public async updateDOB({
        userID,
        dateOfBirth
    }: UpdateDOBServiceParams) {
        return this.updateDOBService.execute({
            userID,
            dateOfBirth
        });
    }

    public async updateProfilePic({
        userID,
        profilePicURI
    }: UpdateProfilePicServiceParams) {
        return this.updateProfilePicService.execute({
            userID,
            profilePicURI
        });
    }

    public async updateUsername({
        userID,
        username
    }: UpdateUsernameServiceParams) {
        return this.updateUsernameService.execute({
            userID,
            username
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