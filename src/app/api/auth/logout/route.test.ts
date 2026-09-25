/** @jest-environment node */

import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/auth/logout/route';
import { fakeCookieStore } from '@/test/server/cookie-store';

jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

const expired = { value: '', maxAge: 0, path: '/', httpOnly: true, sameSite: 'lax' };

describe('OAuth logout route', () => {
  const env = { ...process.env };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env = { ...env };
  });

  it('expires the __Host- session cookies and the legacy unprefixed ones', async () => {
    process.env.AUTH_COOKIE_SECURE = 'true';
    const jar = fakeCookieStore({
      '__Host-auth_token': 'access-1',
      '__Host-refresh_token': 'refresh-1',
      auth_token: 'old-access',
      refresh_token: 'old-refresh',
    });
    (cookies as jest.Mock).mockResolvedValue(jar.store);

    const response = await POST(new NextRequest('https://admin.yildizskylab.com/api/auth/logout'));

    expect(response.status).toBe(200);
    expect(jar.sentNames().sort()).toEqual([
      '__Host-access_token',
      '__Host-auth_token',
      '__Host-refresh_token',
      'access_token',
      'auth_token',
      'refresh_token',
      'token',
    ]);
    for (const name of jar.sentNames()) {
      expect(jar.sent(name)).toEqual({ ...expired, secure: true });
    }
  });

  it('expires every plain session cookie on local http', async () => {
    process.env.AUTH_COOKIE_SECURE = 'false';
    const jar = fakeCookieStore({ auth_token: 'access-1', refresh_token: 'refresh-1' });
    (cookies as jest.Mock).mockResolvedValue(jar.store);

    const response = await POST(new NextRequest('http://localhost:3000/api/auth/logout'));

    expect(response.status).toBe(200);
    expect(jar.sentNames().sort()).toEqual([
      'access_token',
      'auth_token',
      'refresh_token',
      'token',
    ]);
    for (const name of jar.sentNames()) {
      expect(jar.sent(name)).toEqual({ ...expired, secure: false });
    }
  });
});
