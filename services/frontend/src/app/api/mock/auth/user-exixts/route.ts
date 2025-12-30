import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { identifier } = body;

    if (!identifier || typeof identifier !== "string") {
      return NextResponse.json(
        { error: "Invalid identifier" },
        { status: 400 }
      );
    }

    // Mock logic for next step:
    // - If it looks like an email that exists → ask for password
    // - If it's a new email → ask for username
    // - Otherwise → default to email
    let nextStep: "email" | "username" | "password" = "email";

    if (identifier.includes("@")) {
      // Treat emails ending with "exist.com" as existing users
      nextStep = identifier.endsWith("@exist.com") ? "password" : "username";
    } else {
      // Treat usernames starting with "user" as existing → password
      nextStep = identifier.startsWith("user") ? "password" : "email";
    }

    // Return in the shape your frontend expects
    return NextResponse.json({ body: { nextStep } });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
