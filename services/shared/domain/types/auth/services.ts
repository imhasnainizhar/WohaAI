// Response interface for get started service
export interface GetStartedApiResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    identifierType: string;
    identifier: string;
    already_exists: boolean;
  };
  cookies: Array<{ name: string; value: string; options: any }>;
}

// Request interface for get started service
export interface GetStartedDate {
  username: string;
  email: string;
}