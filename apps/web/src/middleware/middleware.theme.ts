import { NextRequest, NextResponse } from "next/server";

const THEME_COOKIE = "theme";
const DEFAULT_THEME = "dark";

export function middleware(req: NextRequest) {
  const theme = req.cookies.get(THEME_COOKIE)?.value;

  const res = NextResponse.next();

  if (!theme) {
    res.cookies.set({
      name: "theme_cookie",
      value: DEFAULT_THEME,
      path: "/",
      httpOnly: false, // client JS can read/update it
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });
  }

  return res;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};