import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/server/get-user-id";
import {
  getUserSettings,
  updateUserSettings,
} from "@/server/services/settings";

export async function GET(req: NextRequest) {
  const userId = await getUserIdFromRequest(req);

  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const result = await getUserSettings(userId);

  return NextResponse.json(result);
}

export async function PATCH(req: NextRequest) {
  // const userId = await getUserIdFromRequest(req);
  const userId = "507f1f77bcf86cd799439011";

  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();

    const result = await updateUserSettings(userId, body);

    return NextResponse.json(result);
  } catch (error) {
    console.error("[PATCH /api/settings] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}