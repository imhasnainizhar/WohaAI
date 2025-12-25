// user.types.ts
export type UserRecord = {
  userID: string;
  email: string;
  username: string;
  firstName?: string | null;
  lastName?: string | null;
  createdAt: Date;
  updatedAt: Date;
  // DB-only / sensitive
  passwordHash?: string | null;
  resetToken?: string | null;
};

export type PublicUser = {
  userID: string;
  username: string;
  firstName?: string | null;
  lastName?: string | null;
  createdAt: Date;
};

/** Remove sensitive/internal fields before sending to client */
export function sanitizeUser(user: UserRecord): PublicUser {
  return {
    userID: user.userID,
    username: user.username,
    firstName: user.firstName ?? null,
    lastName: user.lastName ?? null,
    createdAt: user.createdAt,
  };
}
