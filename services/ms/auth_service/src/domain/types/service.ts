export interface VerificationEmail {
  to: string;
  subject: string;
  html: string;
  metadata?: Record<string, unknown>;
}
