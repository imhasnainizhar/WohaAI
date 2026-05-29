import { verifyUserEmailService } from "@services/signup/verification/confirm_email";
import { getCache, deleteCache, setCache } from "../../../../src/redis/redis";
import { createJwtToken } from "../../../../src/ua/jwt";
import { ServiceException } from "../../../../src/ua/response";
import { EXPIRATION, env } from "@config/env";

// Mocks
jest.mock("@utils/redis");
jest.mock("@utils/jwt");

// Mock authLogger to suppress console output during tests
jest.mock("@utils/authLogger", () => ({
  authLogger: {
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    fatal: jest.fn(),
  },
}));

describe("verifyUserEmailService", () => {
  // Use typed mocks for better autocomplete and assertion tracking
  const mockedGetCache = jest.mocked(getCache);
  const mockedDeleteCache = jest.mocked(deleteCache);
  const mockedSetCache = jest.mocked(setCache);
  const mockedCreateJwtToken = jest.mocked(createJwtToken);

  const signupSessionID = "abc123session";
  const email = "user@example.com";

  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("throws when inputs are missing", async () => {
    // Basic validation: service should reject empty payloads
    await expect(
      verifyUserEmailService({
        signupSessionID: "",
        verificationCode: ""
      } as any)
    ).rejects.toBeInstanceOf(ServiceException);
  });

  test("throws when code is not 6-digit numeric", async () => {
    // Format validation: ensure only standard 6-digit codes are processed
    await expect(
      verifyUserEmailService({
        signupSessionID,
        verificationCode: "123"
      })
    ).rejects.toBeInstanceOf(ServiceException);
  });

  test("throws when pending signup user is missing", async () => {
    // Scenario: The session record in Redis has expired or does not exist
    mockedGetCache.mockResolvedValueOnce(null);

    await expect(
      verifyUserEmailService({
        signupSessionID,
        verificationCode: "123456"
      })
    ).rejects.toBeInstanceOf(ServiceException);
  });

  test("throws when verification code cache expired", async () => {
    // Scenario: User session exists, but the OTP (one-time password) has timed out
    mockedGetCache
      .mockResolvedValueOnce(JSON.stringify({ email }))  // pending signup found
      .mockResolvedValueOnce(null);                      // code record missing

    await expect(
      verifyUserEmailService({
        signupSessionID,
        verificationCode: "123456"
      })
    ).rejects.toBeInstanceOf(ServiceException);
  });

  test("throws when verification code does not match", async () => {
    // Security check: provided code must match the one stored in Redis
    mockedGetCache
      .mockResolvedValueOnce(JSON.stringify({ email }))  // pending signup found
      .mockResolvedValueOnce("999999");                  // actual stored code

    await expect(
      verifyUserEmailService({
        signupSessionID,
        verificationCode: "123456"
      })
    ).rejects.toBeInstanceOf(ServiceException);
  });

  test("successfully verifies and returns token + cookie", async () => {
    // Happy path: session valid and code matches
    mockedGetCache
      .mockResolvedValueOnce(JSON.stringify({ email }))  // found session
      .mockResolvedValueOnce("123456");                   // found matching code

    mockedCreateJwtToken.mockReturnValue("token-xyz");

    const res = await verifyUserEmailService({
      signupSessionID,
      verificationCode: "123456"
    });

    expect(res.success).toBe(true);
    expect(res.statusCode).toBe(200);

    // Verify cleanup: used code should be deleted to prevent replay attacks
    expect(mockedDeleteCache).toHaveBeenCalledWith(
      `verification_code:${signupSessionID}`
    );

    // Verify state transition: mark this session as "email confirmed" in Redis
    expect(mockedSetCache).toHaveBeenCalledWith(
      `email_confirmed:${signupSessionID}`,
      email,
      EXPIRATION.REDIS_SIGNUP_SESSION_TTL_EXTENDED
    );

    expect(res.cookies?.[0].value).toBe("token-xyz");
  });

  test("unexpected errors are wrapped into ServiceException", async () => {
    // Resilience check: handle database/redis network failures gracefully
    mockedGetCache.mockRejectedValueOnce(new Error("boom"));

    await expect(
      verifyUserEmailService({
        signupSessionID,
        verificationCode: "123456"
      })
    ).rejects.toBeInstanceOf(ServiceException);
  });
});