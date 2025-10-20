import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";

const JWT_SECRET = process.env.SIGNUP_JWT_SECRET || "change_me_please";
const TOKEN_TTL_SECONDS = Number(process.env.SIGNUP_JWT_TTL_SECONDS || 15 * 60); // 15m

export function createToken(sessionId: string, step: string) {
  return jwt.sign(
    { sid: sessionId, jti: randomUUID() },
    JWT_SECRET,
    { expiresIn: TOKEN_TTL_SECONDS }
  );
}

export function verifyToken(token: string, expectedStep: string): { sid: string, step: string } {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    if (!payload?.sid) throw new Error("invalid token payload");
    if(expectedStep && payload.step !== expectedStep){
      throw new Error("token not valid for this step")
    }
    return { sid: payload.sid as string, step: payload.step as string };
  } catch (err) {
    throw new Error("Invalid or expired signup token");
  }
}
