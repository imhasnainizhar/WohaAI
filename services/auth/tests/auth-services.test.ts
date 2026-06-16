import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthRepo } from '@/repo/auth-repo';
import { SignoutService } from '@/services/signout';
import { RefreshSessionService } from '@/services/refresh-session';
import { SignupInitService } from '@/services/signup/init';
import { createJwtToken } from '@packages/jwt';
import { setSignupSession, getSignupSession } from '@/redis/redis';
import { ContinueWithEmailService } from '@/services/signup/continue/email';
import { ContinueWithUsernameService } from '@/services/signup/continue/username';
import { SendVerificationEmailService } from '@/services/signup/verification/send-verification-email';
import { VerifyUserEmailService } from '@/services/signup/verification/verify-user-email';

vi.mock('@/repo/auth-repo');
vi.mock('@packages/jwt');
vi.mock('@/redis/redis');

const mockSession = {
  userSessionID: 'sess-123',
  userDeviceName: 'device',
  userIPAddress: '127.0.0.1',
};

describe('SignoutService', () => {
  let repo: any;
  let service: SignoutService;

  beforeEach(() => {
    repo = new AuthRepo(null as any);
    (repo.findActiveSession as any) = vi.fn().mockResolvedValue(mockSession);
    (repo.revokeSession as any) = vi.fn().mockResolvedValue(undefined);
    service = new SignoutService(repo);
  });

  it('revokes an active session', async () => {
    const result = await service.execute({ userID: 'user-1', userSessionID: 'sess-123' });
    expect(repo.findActiveSession).toHaveBeenCalledWith({ userID: 'user-1', userSessionID: 'sess-123' });
    expect(repo.revokeSession).toHaveBeenCalledWith('sess-123');
    expect(result).toEqual({ signedOut: true });
  });
});

describe('RefreshSessionService', () => {
  let repo: any;
  let service: RefreshSessionService;

  beforeEach(() => {
    repo = new AuthRepo(null as any);
    (repo.findActiveSession as any) = vi.fn().mockResolvedValue({ ...mockSession, userID: 'user-1' });
    (repo.revokeSession as any) = vi.fn().mockResolvedValue(undefined);
    (repo.createSession as any) = vi.fn().mockResolvedValue({ accessToken: 'newAccess', refreshToken: 'newRefresh' });
    (createJwtToken as any) = vi.fn().mockImplementation(() => 'jwt');
    service = new RefreshSessionService(repo);
  });

  it('refreshes a valid session', async () => {
    const result = await service.execute({ refreshToken: 'oldRefresh', userIPAddress: '127.0.0.1' });
    expect(repo.findActiveSession).toHaveBeenCalled();
    expect(repo.revokeSession).toHaveBeenCalled();
    expect(repo.createSession).toHaveBeenCalled();
    expect(result).toMatchObject({ accessToken: expect.any(String), refreshToken: expect.any(String) });
  });
});

describe('SignupInitService', () => {
  let repo: any;
  let service: SignupInitService;

  beforeEach(() => {
    repo = new AuthRepo(null as any);
    (repo.findUserWithUsernameOrEmail as any) = vi.fn().mockResolvedValue(null);
    (setSignupSession as any) = vi.fn().mockResolvedValue(undefined);
    (createJwtToken as any) = vi.fn().mockImplementation(() => 'signupToken');
    service = new SignupInitService(repo);
  });

  it('creates a signup session for a new email', async () => {
    const response = await service.execute({ usernameOrEmail: { type: 'email', value: 'new@example.com' } });
    expect(repo.findUserWithUsernameOrEmail).toHaveBeenCalled();
    expect(setSignupSession).toHaveBeenCalled();
    expect(createJwtToken).toHaveBeenCalled();
    expect(response).toEqual({ signupSessionInit: true, alreadyExists: false, signupSessionToken: 'signupToken' });
  });
});

describe('ContinueWithUsernameService', () => {
  let repo: any;
  let service: ContinueWithUsernameService;

  beforeEach(() => {
    repo = new AuthRepo(null as any);
    (repo.updateSignupSessionUsername as any) = vi.fn().mockResolvedValue(undefined);
    service = new ContinueWithUsernameService(repo);
  });

  it('stores the chosen username', async () => {
    const result = await service.execute({ signupSessionID: 'sess-1', username: 'newuser' });
    expect(repo.updateSignupSessionUsername).toHaveBeenCalledWith('sess-1', 'newuser');
    expect(result).toBeUndefined();
  });
});

describe('ContinueWithEmailService', () => {
  let repo: any;
  let service: ContinueWithEmailService;

  beforeEach(() => {
    repo = new AuthRepo(null as any);
    (repo.updateSignupSessionEmail as any) = vi.fn().mockResolvedValue(undefined);
    service = new ContinueWithEmailService(repo);
  });

  it('stores the chosen email', async () => {
    const result = await service.execute({ signupSessionID: 'sess-2', email: 'test@example.com' });
    expect(repo.updateSignupSessionEmail).toHaveBeenCalledWith('sess-2', 'test@example.com');
    expect(result).toBeUndefined();
  });
});

describe('SendVerificationEmailService', () => {
  let service: SendVerificationEmailService;

  beforeEach(() => {
    (createJwtToken as any) = vi.fn().mockImplementation(() => 'verifyToken');
    service = new SendVerificationEmailService();
  });

  it('generates a verification token', async () => {
    const result = await service.execute({ signupSessionID: 'sess-3' });
    expect(createJwtToken).toHaveBeenCalled();
    expect(result).toBeUndefined(); // actual email sending is side‑effect; we only verify token generation here
  });
});

describe('VerifyUserEmailService', () => {
  let repo: any;
  let service: VerifyUserEmailService;

  beforeEach(() => {
    repo = new AuthRepo(null as any);
    (repo.finalizeSignup as any) = vi.fn().mockResolvedValue(undefined);
    service = new VerifyUserEmailService();
  });

  it('finalizes signup when verification succeeds', async () => {
    const result = await service.execute({ signupSessionID: 'sess-4', verificationCode: '123456' });
    expect(repo.finalizeSignup).toHaveBeenCalledWith('sess-4');
    expect(result).toBeUndefined();
  });
});
