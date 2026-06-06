import { User } from "@packages/models"

export interface CreateUserParams {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    hashedPassword: string;
    dateOfBirth?: Date | null;
}

export interface UpdateUserParams {
    userID: string;
    firstName?: string;
    lastName?: string;
    username?: string;
    dateOfBirth?: Date | null;
}

export class UserRepo {
    constructor(
        protected readonly user = User
    ) {}

    async createUser({
        firstName,
        lastName,
        username,
        email,
        hashedPassword,
        dateOfBirth
    }: CreateUserParams) {
        return await this.user.create({
            firstName,
            lastName,
            username,
            email,
            hashedPassword,
            dateOfBirth
        });
    }

    async updateUser({
        userID,
        firstName,
        lastName,
        username,
        dateOfBirth
    }: UpdateUserParams) {
        return await this.user.findOneAndUpdate(
            { userID },
            {
                firstName,
                lastName,
                username,
                dateOfBirth
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
            userID
        });
    }
}