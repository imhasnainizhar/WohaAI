import { randomUUID } from "crypto";
import { BaseJwtPayload } from "./payload";
import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import { NormalizedError } from "@packages/errors";

export interface CreateJwtTokenParams<T>{
  payload: T;
  secret: string;
  options: SignOptions
}

export interface VerifyJwtTokenParams {
  token: string;
  secret: string;
}

export function createJwtToken<T extends BaseJwtPayload>({
  payload,
  secret,
  options
}: CreateJwtTokenParams<T>): string {
  return jwt.sign(payload, secret, options);
}

/**
 * Verify a JWT token and return its payload (typed).
 */
export function verifyJwtToken<T extends BaseJwtPayload>({
  token,
  secret
}: VerifyJwtTokenParams): T {
  try {
    return jwt.verify(
      token,
      secret
    ) as T;
  } catch (err: unknown) {
    throw new NormalizedError(err);
  }
}