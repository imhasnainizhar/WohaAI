import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { username, email } = body;

  console.log("Mock signin check:", { username, email });

  // Logic to determine next step
  let nextStep: "email" | "username" | "password" = "email";

  if (username) {
    nextStep = "password";
  } else if (email) {
    nextStep = "username";
  }

  return NextResponse.json({ body: { nextStep } });
}
