import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const theme = req.cookies.get("theme")?.value;

  const res = NextResponse.next();

  if (!theme) {
    res.cookies.set("theme", "dark", {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      httpOnly: false,
    });
  }

  return res;
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};