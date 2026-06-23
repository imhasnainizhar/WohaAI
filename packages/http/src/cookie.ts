
// Interface for HTTP cookies

export type CookieOptions = {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "lax" | "strict" | "none";
  path?: string;
  maxAge?: number;
  domain?: string;
};

export interface Cookie {
  name: string;
  value: string;
  options: CookieOptions;
}

type BuildCookieInput = {
  name: string;
  value: string;
  options?: CookieOptions;
};

export const buildCookie = ({
  name,
  value,
  options,
}: BuildCookieInput): Cookie => {
  return {
    name,
    value,
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      ...options,
    },
  };
};