import { User } from "@wohaai/db"

export interface CreateUserParams {
    username: string;
    email: string;
    hashedPassword: string;
}

export interface UpdateUserParams {
    userID: string;
    fullName?: string;
    username?: string;
    dateOfBirth?: Date | null;
    profilePicURI?: string;
}

export class UserRepo {
    constructor(
        protected readonly user = User
    ) { }

    async createUser({
        username,
        email,
        hashedPassword
    }: CreateUserParams) {
        return await this.user.create({
            username,
            email,
            hashedPassword
        });
    }

    async updateUser({
        userID,
        fullName,
        username,
        dateOfBirth,
        profilePicURI
    }: UpdateUserParams) {
        return await this.user.findOneAndUpdate(
            { id: userID },
            {
                fullName,
                username,
                dateOfBirth,
                profilePicURI
            },
            {
                new: true
            }
        );
    }

    async getUserWithUsername(username: string) {
        return await this.user.findOne({
            username
        });
    }

    async getUserWithEmail(email: string) {
        return await this.user.findOne({
            email
        });
    }

    async getUserWithUserID(userID: string) {
        return await this.user.findOne({
            id: userID
        });
    }
}