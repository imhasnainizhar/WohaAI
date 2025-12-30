// __tests__/generateVerificationCodeService.test.ts
import { Fluvio } from "@fluvio/client";
import { generateVerificationCodeService } from "@services/signup/verification/send_email";
import { setCache, getCache } from "@utils/redis";
import { ServiceException } from "@utils/response";

jest.mock("@utils/redis");

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
    const response = await generateVerificationCodeService(signupSessionId);

    expect(response.success).toBe(true);
    expect(response.data?.code).toHaveLength(6);
    expect(getCache).toHaveBeenCalledWith(`pending_signup:${signupSessionId}`);
    expect(setCache).toHaveBeenCalled();
    expect(mockSend).toHaveBeenCalled();

    const eventPayload = JSON.parse(mockSend.mock.calls[0][1]);
    expect(eventPayload.email).toBe(pendingEmail);
    expect(eventPayload.code).toBe(response.data?.code);
    expect(eventPayload.sessionId).toBe(signupSessionId);
  });

  it("should return error if session does not exist", async () => {
    (getCache as jest.Mock).mockResolvedValue(null);

    const response = await generateVerificationCodeService(signupSessionId);
    expect(response.success).toBe(false);
    expect(response.errorType).toBe("session_expired");
  });

  it("should throw ServiceException if Redis fails to store code", async () => {
    (setCache as jest.Mock).mockResolvedValue(false);

    await expect(generateVerificationCodeService(signupSessionId))
      .rejects
      .toThrow(ServiceException);
  });
});
