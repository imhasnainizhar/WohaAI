import { UserRepo } from "@/repo/user-repo";
import { UserNotFoundError } from "@/errors/service-error";

export interface GetMeServiceParams {
  userID: string;
}

export interface GetMeServiceResponse {
  userID: string;
  fullName: string;
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
    userID
  }: GetMeServiceParams): Promise<GetMeServiceResponse> {
    const user =
      await this.userRepo.getUserWithUserID(userID);

    if (!user) {
      throw new UserNotFoundError();
    }

    return {
      userID: user.id,
      fullName: user.fullName,
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