/** @jest-environment node */

import { cookies } from 'next/headers';
import { GET } from '@/app/api/auth/me/route';
import { fakeCookieStore } from '@/test/server/cookie-store';

jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

/** A live access token that names no user (no `sub`), so the session cannot be used. */
function tokenWithoutUser(): string {
  const header = Buffer.from(JSON.stringify({ alg: 'none' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 300 })).toString(
    'base64url',
  );
  return `${header}.${body}.sig`;
}

describe('GET /api/auth/me', () => {
  const env = { ...process.env };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.AUTH_COOKIE_SECURE = 'true';
  });

  afterEach(() => {
    process.env = { ...env };
  });

  it('expires the session cookies, current and legacy, when the session names no user', async () => {
    const jar = fakeCookieStore({
      '__Host-auth_token': tokenWithoutUser(),
      '__Host-refresh_token': 'refresh-1',
      auth_token: 'old-access',
      refresh_token: 'old-refresh',
    });
    (cookies as jest.Mock).mockResolvedValue(jar.store);

    const response = await GET();

    expect(response.status).toBe(401);
    expect(jar.sentNames().sort()).toEqual([
      '__Host-access_token',
      '__Host-auth_token',
      '__Host-refresh_token',
      'access_token',
      'auth_token',
      'refresh_token',
      'token',
    ]);
    // A __Host- cookie is only replaced by a Set-Cookie that is itself Secure with Path=/.
    for (const name of jar.sentNames()) {
      expect(jar.sent(name)).toEqual({
        value: '',
        maxAge: 0,
        path: '/',
        secure: true,
        httpOnly: true,
        sameSite: 'lax',
      });
    }
  });
});
