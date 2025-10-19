export interface ServiceSuccess<T> {
  success: true;
  statusCode: number;
  message: string;
  data: T;
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
}

export interface ServiceFailure {
  success: false;
  message: string;
  statusCode: number;
  errorType: string; // e.g., "validation_error", "not_found", "internal_error"
  errors?: Record<string, string[]>; // optional validation errors
}

export type ServiceResult<T> = ServiceSuccess<T> | ServiceFailure;
