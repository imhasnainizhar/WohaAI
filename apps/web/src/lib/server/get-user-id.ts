import { NextRequest } from "next/server";

/**
 * STUB — Replace the body of this function with your actual auth logic.
 *
 * It must return the authenticated user's ID (string) or null if the
 * request is unauthenticated.
 *
 * Common patterns:
 *   next-auth   → const s = await getServerSession(authOptions); return s?.user?.id ?? null;
 *   JWT cookie  → verify + decode the JWT from req.cookies
 *   Clerk       → const { userId } = auth(); return userId;
 */
export async function getUserIdFromRequest(
  req: NextRequest
): Promise<string | null> {
  // ⚠️  PLACEHOLDER — swap this out before shipping
  const userId = req.headers.get("x-user-id");
  return userId ?? null;
}