// user.types.ts
export type UserRecord = {
  id: string;
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
  id: string;
  username: string;
  firstName?: string | null;
  lastName?: string | null;
  createdAt: Date;
};

/** Remove sensitive/internal fields before sending to client */
export function sanitizeUser(user: UserRecord): PublicUser {
  return {
    id: user.id,
    username: user.username,
    firstName: user.firstName ?? null,
    lastName: user.lastName ?? null,
    createdAt: user.createdAt,
  };
}
