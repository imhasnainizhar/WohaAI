import { validateDisplayNameService, validateEmailService, validatePasswordService } from "@services/signup/signup";
import * as redisClientUtils from "@utils/redis";
import { prisma } from "@utils/prisma";
import { ServiceException } from "../../../src/utils/response";
import { setCache } from "@utils/redis";

jest.mock("@utils/redis_client");
jest.mock("@utils/prisma_client", () => ({
  prisma: {
    user: { findUnique: jest.fn() }
  }
}));

jest.mock("@utils/logger", () => ({
  logger: { debug: jest.fn(), info: jest.fn(), fatal: jest.fn() }
}));

const mockSetCache = setCache as jest.MockedFunction<typeof setCache>;
const mockPrismaFind = prisma.user.findUnique as jest.MockedFunction<typeof prisma.user.findUnique>;

describe("Signup Services", () => {
  const signupSessionID = "test-session";

  afterEach(() => jest.clearAllMocks());

  // --- DISPLAY NAME ---
  describe("validateDisplayNameService", () => {
    it("should validate and cache display name successfully", async () => {
      jest.spyOn(redisClientUtils, "getPending").mockResolvedValue({
        firstName: "", lastName: "", email: "", password: ""
      });
      mockSetCache.mockResolvedValue(true);

      const result = await validateDisplayNameService(signupSessionID, "John", "Doe");

      expect(result.success).toBe(true);
      expect(mockSetCache).toHaveBeenCalledWith(
        `pending_signup:${signupSessionID}`,
        expect.stringContaining('"firstName":"John"'),
        expect.any(Number)
      );
    });

    it("should throw error if display name is invalid", async () => {
      jest.spyOn(redisClientUtils, "getPending").mockResolvedValue({
        firstName: "", lastName: "", email: "", password: ""
      });

      await expect(validateDisplayNameService(signupSessionID, "", "")).rejects.toThrow();
    });

    it("should throw session expired if Redis returns null", async () => {
      jest.spyOn(redisClientUtils, "getPending").mockResolvedValue(null);

      await expect(validateDisplayNameService(signupSessionID, "John", "Doe")).rejects.toThrow();
    });
  });

  // --- EMAIL ---
  describe("validateEmailService", () => {
    it("should validate and cache email successfully", async () => {
      jest.spyOn(redisClientUtils, "getPending").mockResolvedValue({
        firstName: "", lastName: "", email: "", password: ""
      });
      mockSetCache.mockResolvedValue(true);
      mockPrismaFind.mockResolvedValue(null);

      const result = await validateEmailService(signupSessionID, "test@example.com");

      expect(result.success).toBe(true);
      expect(mockSetCache).toHaveBeenCalledWith(
        `pending_signup:${signupSessionID}`,
        expect.stringContaining('"email":"test@example.com"'),
        expect.any(Number)
      );
    });

    it("should throw error if email is invalid", async () => {
      jest.spyOn(redisClientUtils, "getPending").mockResolvedValue({
        firstName: "", lastName: "", email: "", password: ""
      });

      await expect(validateEmailService(signupSessionID, "invalid-email")).rejects.toThrow();
    });

    it("should throw conflict error if email already exists", async () => {
      jest.spyOn(redisClientUtils, "getPending").mockResolvedValue({
        firstName: "", lastName: "", email: "", password: ""
      });
      mockPrismaFind.mockResolvedValue({ id: "123", email: "exists@example.com" } as any);

      await expect(validateEmailService(signupSessionID, "exists@example.com")).rejects.toThrow();
    });

    it("should throw session expired if Redis returns null", async () => {
      jest.spyOn(redisClientUtils, "getPending").mockResolvedValue(null);
      await expect(validateEmailService(signupSessionID, "test@example.com")).rejects.toThrow();
    });
  });
});
