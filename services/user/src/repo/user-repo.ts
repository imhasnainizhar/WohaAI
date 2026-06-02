import { UserPrismaClient } from "@packages/prisma-users";


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
        protected readonly prisma: UserPrismaClient
    ) {}

    async createUser({
        firstName,
        lastName,
        username,
        email,
        hashedPassword,
        dateOfBirth
    }: CreateUserParams) {
        return await this.prisma.user.create({
            data: {
                firstName,
                lastName,
                username,
                email,
                hashedPassword,
                dateOfBirth
            }
        });
    }

    async updateUser({
        userID,
        firstName,
        lastName,
        username,
        dateOfBirth
    }: UpdateUserParams) {
        return await this.prisma.user.update({
            where: {
                userID
            },
            data: {
                firstName,
                lastName,
                username,
                dateOfBirth
            }
        });
    }

    async getUserWithUsername(username: string) {
        return await this.prisma.user.findUnique({
            where: {
                username
            }
        });
    }

    async getUserWithEmail(email: string) {
        return await this.prisma.user.findUnique({
            where: {
                email
            }
        });
    }

    async getUserWithUserID(userID: string) {
        return await this.prisma.user.findUnique({
            where: {
                userID
            }
        });
    }
}

export type CreateUserResult = Awaited<ReturnType<UserRepo["createUser"]>>
export type UpdateUserResult = Awaited<ReturnType<UserRepo["updateUser"]>>

export type GetUserWithUserIDResult = Awaited<ReturnType<UserRepo["getUserWithUserID"]>>;
export type GetUserWithUsernameResult = Awaited<ReturnType<UserRepo["getUserWithUsername"]>>;
export type GetUserWithEmailResult = Awaited<ReturnType<UserRepo["getUserWithEmail"]>>;