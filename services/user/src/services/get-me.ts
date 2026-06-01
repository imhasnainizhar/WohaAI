import { UserRepo } from "@/repo/user-repo";
import { UserNotFoundError } from "@/errors/service-error";

export interface GetMeServiceParams {
  userID: string;
}

export interface GetMeServiceResponse {
  userID: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  profilePicURI: string | null;
  dateOfBirth: Date | null;
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
      userID: user.userID,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      profilePicURI: user.profilePicURI,
      dateOfBirth: user.dateOfBirth,
      twoFactorEnabled: user.twoFactorEnabled,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }
}