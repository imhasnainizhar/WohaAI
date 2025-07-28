import { sendVerificationEmail } from "@lib/mailer/codeMailer";
import generateVerificationCode from "@utils/generateVerificationCode";
import redisClient from "@lib/db/redisClient";

export async function POST(req: Request) {
  try {
    const reqBody = await req.json();
    const {email} = reqBody
    console.log(reqBody)
    console.log(email)

    if (!email || typeof email !== "string") {
      return new Response(JSON.stringify({ error: "Invalid email" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const verificationCode = generateVerificationCode();
    const key = `verify:${email}`;
    console.log(key , verificationCode)
    const ttl = 300; // 5 minutes

    await redisClient.set(key, verificationCode, "EX", ttl);
    console.log({
      EMAIL_USER: process.env.EMAIL_USER,
      EMAIL_PASS: process.env.EMAIL_PASS ? '✅ set' : '❌ missing',
    });    
    await sendVerificationEmail(email, verificationCode);

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error sending verification email:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
