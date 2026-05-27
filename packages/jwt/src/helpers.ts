import { randomUUID } from "crypto";
import { BaseJwtPayload } from "./payload";
import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";

export function createJwtToken<T extends BaseJwtPayload>(
    payload: T,
    secret: string,
    options?: SignOptions
  ): string {
  
    return jwt.sign(payload, secret, options);
  }
  
  /**
   * Verify a JWT token and return its payload (typed).
   */
  export function verifyJwtToken<T extends BaseJwtPayload>(
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
  