// This file is mostly legacy type for this project's service

export interface ServiceResponse<T> {
  success: true;
  statusCode: number;
  message: string;
  data?: T;
  cookies?: {
    name: string;
    value: string;
    options: {
      httpOnly: boolean;
      secure: boolean;
      sameSite: "none" | "lax" | "strict";
      path: string;
      maxAge: number;
    };
  }[];
  errorType?: string; // e.g., "validation_error", "not_found", "internal_error"
  errors?: Record<string, string[]>; // optional validation errors
}