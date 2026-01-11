import { Cookie } from "@shared/common/auth/cookie";
import { Response } from "express";

/* -------------------------------------------------------
   API RESPONSE (for controllers)
-------------------------------------------------------- */
export interface ApiResponseOptions<T = unknown> {
  res: Response;
  success?: boolean; // defaults handled inside sendResponse
  statusCode?: number;
  message: string;
  data?: T;
  cookies?: Cookie[];
  errors?: Record<string, string[]>;
  errorType?: string;
  path?: string;
}
