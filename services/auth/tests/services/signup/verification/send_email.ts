// __tests__/generateVerificationCodeService.test.ts
import { env } from "@config/env";
import { Fluvio } from "@fluvio/client";
import { SendVerificationEmailDTO } from "../../../../../../packages/api/src/auth";
import { sendVerificationEmailService } from "@services/signup/verification/send_email";
import { setCache, getCache } from "../../../../src/helpers/redis";
import { ServiceException } from "../../../../src/helpers/response";

// Mocks
jest.mock("@utils/redis");

// Mock logger to suppress console output during tests
jest.mock("@utils/logger", () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    fatal: jest.fn(),
  },
}));

jest.mock("@fluvio/client", () => {
  const mockSend = jest.fn().mockResolvedValue(true);

  return {
    Fluvio: jest.fn().mockImplementation(() => ({
      connect: jest.fn().mockResolvedValue(undefined),
      topicProducer: jest.fn().mockResolvedValue({ send: mockSend }),
    })),
    __esModule: true, // <-- important for TS & named exports
  };
});

describe("generateVerificationCodeService", () => {

  const signupSessionId = "session123";
  const pendingEmail = "user@example.com";
  const pendingUserStr = JSON.stringify({ email: pendingEmail });
  const dto: SendVerificationEmailDTO = {
    signupSessionID: signupSessionId,
    firstName: "John",
    lastName: "Doe",
    email: pendingEmail,
    verificationCode: "123456",
  };

  let mockSend: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    // Redis mocks
    (getCache as jest.Mock).mockResolvedValue(pendingUserStr);
    (setCache as jest.Mock).mockResolvedValue(true);

    // Fluvio mock
    mockSend = jest.fn().mockResolvedValue(true);
    (Fluvio as jest.Mock).mockImplementation(() => ({
      connect: jest.fn().mockResolvedValue(undefined),
      topicProducer: jest.fn().mockResolvedValue({ send: mockSend }),
    }));
  });

  it("should generate a verification code and send Fluvio event", async () => {
    const response = await sendVerificationEmailService(dto);

    expect(response.success).toBe(true);
    expect(getCache).toHaveBeenCalledWith(`${env.ACTIVE_SIGNUP_SESSION_CACHE_KEY}:${signupSessionId}`);
    expect(setCache).toHaveBeenCalled();
    expect(mockSend).toHaveBeenCalled();

    const eventPayload = JSON.parse(mockSend.mock.calls[0][1]);
    expect(eventPayload.email).toBe(pendingEmail);
    expect(eventPayload.sessionId).toBe(signupSessionId);
  });

  it("should return error if session does not exist", async () => {
    (getCache as jest.Mock).mockResolvedValue(null);

    const response = await sendVerificationEmailService(dto);
    expect(response.success).toBe(false);
    expect(response.errorType).toBe("session_expired");
  });

  it("should throw ServiceException if Redis fails to store code", async () => {
    (setCache as jest.Mock).mockResolvedValue(false);

    await expect(sendVerificationEmailService(dto))
      .rejects
      .toThrow(ServiceException);
  });
});
