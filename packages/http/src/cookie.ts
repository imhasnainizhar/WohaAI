
// Interface for HTTP cookies

export interface Cookie {
    name: string;
    value: string;
    options: {
      httpOnly: boolean;
      secure: boolean;
      sameSite: "lax" | "strict" | "none";
      path: string;
      maxAge?: number;
    };
  }