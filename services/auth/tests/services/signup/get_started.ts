import { getStartedService } from "@services/signup/get_started";
import { prisma } from "@clients/prisma";
import { setCache } from "@helpers/redis";
import { createJwtToken } from "@helpers/jwt";
import { env, EXPIRATION } from "@config/env";
import { ServiceException } from "@helpers/response";
import { GetStartedDTO } from "../../../../../packages/api/src/auth";

// Mock external dependencies (DB, Redis, JWT, authLogger)
jest.mock("@clients/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock("@utils/redis", () => ({
  setCache: jest.fn(),
}));

jest.mock("@utils/jwt", () => ({
  createJwtToken: jest.fn(),
}));

jest.mock("@utils/authLogger", () => ({
  authLogger: {
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    fatal: jest.fn(),
  },
}));

// Mock Crypto to return deterministic UUIDs for assertions
jest.mock("crypto", () => ({
  randomUUID: jest.fn(() => "uuid-123"),
}));

// ---- ENV + EXPIRATION SETUP -----
// Override env vars to ensure tests run deterministically
(env as any).JWT_SIGNUP_SESSION_SECRET_KEY = "SIGNUP_KEY";
(env as any).JWT_SIGNIN_SESSION_SECRET_KEY = "SIGNIN_KEY";
(env as any).ACTIVE_SIGNUP_SESSION_CACHE_KEY = "signup";
(env as any).SIGNUP_SESSION_TOKEN_NAME = "signup_token";
(env as any).SIGNIN_SESSION_TOKEN_NAME = "signin_token";
(env as any).SECURE_COOKIE_OPTION = false;
(env as any).SAME_SITE_COOKIE_OPTION = "lax";

(EXPIRATION as any).JWT_SIGNUP_SESSION_TOKEN = 300;
(EXPIRATION as any).JWT_SIGNIN_SESSION_TOKEN = 300;
(EXPIRATION as any).SIGNUP_SESSION_COOKIE = 300;
(EXPIRATION as any).SIGNIN_SESSION_COOKIE = 300;
(EXPIRATION as any).REDIS_SIGNUP_SESSION_TTL = 300;
(EXPIRATION as any).REDIS_SIGNIN_SESSION_TTL = 300;

const existingUser = {
  userID: "u1",
};

describe("getStartedService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ---------------- SIGNIN PATH ----------------
  // Occurs when the user ALREADY exists in the database
  test("returns signin flow when username exists", async () => {
    // Setup: User found in DB
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(existingUser);
    (createJwtToken as jest.Mock).mockReturnValue("signin_jwt");

    const dto = {
      usernameOrEmail: { type: "username", value: "john" },
    } as GetStartedDTO;

    const res = await getStartedService(dto);

    // Verify: Correct flag, token generated, and redis caches the UserID
    expect(res.success).toBe(true);
    expect(res.data?.already_exists).toBe(true);
    expect(res.data?.identifier).toBe("john");

    expect(createJwtToken).toHaveBeenCalledWith(
      { userID: "u1", signinSessionID: "uuid-123" },
      "SIGNIN_KEY",
      { expiresIn: 300 }
    );

    expect(setCache).toHaveBeenCalledWith(
      "signup:uuid-123",
      JSON.stringify({ userID: "u1" }), // Cache user ID for signin
      300
    );

    expect(res.cookies?.[0].name).toBe("signin_token");
    expect(res.cookies?.[0].value).toBe("signin_jwt");
  });

  test("returns signin flow when email exists", async () => {
    // Setup: Email found in DB
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(existingUser);
    (createJwtToken as jest.Mock).mockReturnValue("signin_jwt");

    const dto = {
      usernameOrEmail: { type: "email", value: "test@test.com" },
    } as GetStartedDTO;

    const res = await getStartedService(dto);

    expect(res.data?.already_exists).toBe(true);
    expect(res.data?.identifierType).toBe("email");
  });

  // ---------------- SIGNUP PATH ----------------
  // Occurs when the user does NOT exist in the database
  test("returns signup flow when username is new", async () => {
    // Setup: User not found (null)
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (createJwtToken as jest.Mock).mockReturnValue("signup_jwt");

    const dto = {
      usernameOrEmail: { type: "username", value: "newuser" },
    } as GetStartedDTO;

    const res = await getStartedService(dto);

    // Verify: Correct flag, token generated, and Redis caches the raw Identifier
    expect(res.success).toBe(true);
    expect(res.data?.already_exists).toBe(false);
    expect(res.data?.identifier).toBe("newuser");

    expect(createJwtToken).toHaveBeenCalledWith(
      { signupSessionID: "uuid-123" },
      "SIGNUP_KEY",
      { expiresIn: 300 }
    );

    expect(setCache).toHaveBeenCalledWith(
      "signup:uuid-123",
      JSON.stringify({ username: "newuser" }), // Cache username for signup
      300
    );

    expect(res.cookies?.[0].name).toBe("signup_token");
    expect(res.cookies?.[0].value).toBe("signup_jwt");
  });

  test("returns signup flow when email is new", async () => {
    // Setup: Email not found
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (createJwtToken as jest.Mock).mockReturnValue("signup_jwt");

    const dto = {
      usernameOrEmail: { type: "email", value: "new@test.com" },
    } as GetStartedDTO;

    const res = await getStartedService(dto);

    expect(res.data?.identifierType).toBe("email");
    expect(res.data?.already_exists).toBe(false);
  });

  // ---------------- ERROR HANDLING ----------------
  test("wraps DB failure in ServiceException", async () => {
    // Infrastructure failure simulation
    (prisma.user.findUnique as jest.Mock).mockRejectedValue(
      new Error("db down")
    );

    await expect(
      getStartedService({
        usernameOrEmail: { type: "username", value: "x" },
      })
    ).rejects.toBeInstanceOf(ServiceException);
  });

  test("wraps unknown runtime errors", async () => {
    // General runtime crash simulation
    (prisma.user.findUnique as jest.Mock).mockImplementation(() => {
      throw new Error("boom");
    });

    await expect(
      getStartedService({
        usernameOrEmail: { type: "email", value: "x@test.com" },
      })
    ).rejects.toBeInstanceOf(ServiceException);
  });
});