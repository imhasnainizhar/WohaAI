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
    id: string;
    firstName?: string;
    lastName?: string;
    username?: string;
    dateOfBirth?: Date | null;
}

export class UserRepo {
    constructor(
        protected readonly user = User
    ) { }

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
        id,
        firstName,
        lastName,
        username,
        dateOfBirth
    }: UpdateUserParams) {
        return await this.user.findOneAndUpdate(
            { id },
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

    async getUserWithid(id: string) {
        return await this.user.findOne({
            id
        });
    }
}