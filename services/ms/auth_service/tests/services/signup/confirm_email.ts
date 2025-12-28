import { confirmSignupEmailService } from "@services/signup/confirm_email";
import { getCache, setCache, deleteCache } from "@utils/redis";
import { createJwtToken } from "@utils/jwt";
import { ServiceException } from "../../../src/utils/response";
import { EXPIRATION, env } from "@config/env";

// Mocked Dependencies
jest.mock("@utils/redis_client", () => ({
  getCache: jest.fn(),
  setCache: jest.fn(),
  deleteCache: jest.fn(),
}));

jest.mock("@utils/jwt");

jest.mock("@utils/logger", () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    fatal: jest.fn(),
  }
}))


// Describing the tests
describe("confirmSignupEmailService", () => {
  const signupSessionId = "session123";
  const email = "test@example.com";
  const verificationCode = "123456";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ---------------------------------------
  it("should return success with validation token and cookie for correct input", async () => {
    (getCache as jest.Mock).mockImplementation((key: string) => {
      if (key === `pending_signup:${signupSessionId}`) {
        return Promise.resolve(JSON.stringify({ email }));
      }
      if (key === `verification_code:${signupSessionId}`) {
        return Promise.resolve(verificationCode);
      }
      return null;
    });

    (createJwtToken as jest.Mock).mockReturnValue("jwt_token");

    const result = await confirmSignupEmailService(
      verificationCode,
      signupSessionId,
      email
    );

    expect(result.success).toBe(true);
    expect(result.data.validationToken).toBe("jwt_token");
    expect(result?.cookies?.[0].name).toBe(env.SIGNUP_SESSION_TOKEN_NAME);
    expect(setCache).toHaveBeenCalledWith(
      `email_confirmed:${signupSessionId}`,
      email,
      EXPIRATION.REDIS_SIGNUP_SESSION_TTL_EXTENDED
    );
    expect(deleteCache).toHaveBeenCalledWith(`verification_code:${signupSessionId}`);
  });

  // ---------------------------------------
  it("should throw missing credentials error when inputs are missing", async () => {
    await expect(
      confirmSignupEmailService("", "", "")
    ).rejects.toThrow(ServiceException);
  });

  // ---------------------------------------
  it("should throw validation error for invalid verification code format", async () => {
    await expect(
      confirmSignupEmailService("abc", signupSessionId, email)
    ).rejects.toThrow(ServiceException);

    await expect(
      confirmSignupEmailService("123", signupSessionId, email)
    ).rejects.toThrow(ServiceException);
  });

  // ---------------------------------------
  it("should return conflict error when email mismatches pending", async () => {
    (getCache as jest.Mock).mockResolvedValue(JSON.stringify({ email: "other@example.com" }));

    const result = await confirmSignupEmailService(
      verificationCode,
      signupSessionId,
      email
    );

    expect(result.success).toBe(false);
    expect(result.statusCode).toBe(409);
    expect(result.errorType).toBe("signup_state_conflict");
  });

  // ---------------------------------------
  it("should throw error if verification code expired in Redis", async () => {
    (getCache as jest.Mock).mockImplementation((key: string) => {
      if (key === `pending_signup:${signupSessionId}`) {
        return Promise.resolve(JSON.stringify({ email }));
      }
      return null; // no code in Redis
    });

    await expect(
      confirmSignupEmailService(verificationCode, signupSessionId, email)
    ).rejects.toThrow(ServiceException);
  });

  // ---------------------------------------
  it("should throw error if verification code does not match Redis", async () => {
    (getCache as jest.Mock).mockImplementation((key: string) => {
      if (key === `pending_signup:${signupSessionId}`) {
        return Promise.resolve(JSON.stringify({ email }));
      }
      if (key === `verification_code:${signupSessionId}`) {
        return Promise.resolve("654321"); // different code
      }
      return null;
    });

    await expect(
      confirmSignupEmailService(verificationCode, signupSessionId, email)
    ).rejects.toThrow(ServiceException);
  });
});
