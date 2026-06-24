import { serialize } from "cookie";


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

export function serializeCookie(
  cookie: Cookie
): string {
  return serialize(
    cookie.name,
    cookie.value,
    {
      httpOnly: cookie.options?.httpOnly,
      secure: cookie.options?.secure,
      path: cookie.options?.path,
      sameSite: cookie.options?.sameSite,
      maxAge: cookie.options?.maxAge,
      expires:
        cookie.options?.maxAge
          ? new Date(Date.now() + cookie.options.maxAge * 1000)
          : undefined,
      domain: cookie.options?.domain,
    }
  );
}