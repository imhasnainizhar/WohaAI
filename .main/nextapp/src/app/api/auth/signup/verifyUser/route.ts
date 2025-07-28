import { NextResponse } from "next/server";
import z from "zod";
import { VerificationRequestSchema } from "@lib/validators/verification-code-validator-schema";
import redisClient from "@lib/db/redisClient";

type VerificationRequest = z.infer<typeof VerificationRequestSchema>;

export async function POST(req: Request) {
  try {
    const reqBody = await req.json();
    const parsedReq: VerificationRequest = VerificationRequestSchema.parse(reqBody);
    console.log(parsedReq)

    const { email, verificationCode } = parsedReq;

    const storedCode = await redisClient.get(`verify:${email}`);

    if (!storedCode) {
      return NextResponse.json({ EXPIRED_CODE: true }, { status: 401 });
    }

    if (storedCode !== verificationCode) {
      return NextResponse.json({ INVALID_CODE: true }, { status: 400 });
    }

    await redisClient.del(`verify:${email}`);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Verification failed:", error);
    return NextResponse.json({ error: true }, { status: 400 });
  }
}
