import { UserRepo } from "@/repo/user-repo";
import { UserNotFoundError } from "@/errors/service-error";

export interface GetMeServiceParams {
  id: string;
}

export interface GetMeServiceResponse {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  profilePicURI?: string;
  dateOfBirth?: Date;
  twoFactorEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class GetMeService {
  constructor(
    private readonly userRepo: UserRepo
  ) { }

  async execute({
    id
  }: GetMeServiceParams): Promise<GetMeServiceResponse> {
    const user =
      await this.userRepo.getUserWithid(id);

    if (!user) {
      throw new UserNotFoundError();
    }

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      profilePicURI: user.profilePicURI ?? undefined,
      dateOfBirth: user.dateOfBirth ?? undefined,
      twoFactorEnabled: user.twoFactorEnabled,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }
}