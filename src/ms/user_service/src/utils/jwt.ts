import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import { randomUUID } from "crypto";

interface BasePayload {
  jti?: string;
  sid?: string;
  [key: string]: any; // allows custom data
}

/**
 * Create a JWT token with flexible payload.
 */
export function createJwtToken<T extends BasePayload>(
  payload: T,
  secret: string,
  options?: SignOptions
): string {
  const finalPayload = {
    jti: randomUUID(),
    ...payload,
  };

  return jwt.sign(finalPayload, secret, options);
}

/**
 * Verify a JWT token and return its payload (typed).
 */
export function verifyJwtToken<T extends JwtPayload>(
  token: string,
  secret: string
): T {
  try {
    const decoded = jwt.verify(token, secret) as T;
    if (!decoded) throw new Error("Invalid payload");
    return decoded;
  } catch (err: any) {
    throw new Error("Invalid or expired token");
  }
}
