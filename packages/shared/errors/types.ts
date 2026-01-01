/**
 * Base interface for structured error payloads.
 */
export interface StandardError {
  success: false;
  statusCode: number;
  message: string;
  errorType: string;
  errors?: Record<string, string[]>;
}