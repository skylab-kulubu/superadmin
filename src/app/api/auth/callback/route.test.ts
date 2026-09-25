/** @jest-environment node */

import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/auth/callback/route';
import { OAUTH_CODE_VERIFIER_COOKIE, OAUTH_STATE_COOKIE } from '@/lib/auth/oauth-transaction';
import { fakeCookieStore } from '@/test/server/cookie-store';

jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

describe('GET /api/auth/callback', () => {
  const env = { ...process.env };
  const realFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    process.env.AUTH_COOKIE_SECURE = 'true';
    process.env.OAUTH2_ISSUER = 'https://e.yildizskylab.com/realms/e-skylab';
    process.env.OAUTH2_CLIENT_ID = 'superadmin';
    process.env.OAUTH2_REDIRECT_URI = 'https://admin.yildizskylab.com/api/auth/callback';
    // Stands in for Keycloak's token endpoint on the network boundary.
    global.fetch = jest.fn(async () =>
      Response.json({ access_token: 'access-1', refresh_token: 'refresh-1' }),
    ) as typeof fetch;
  });

  afterEach(() => {
    process.env = { ...env };
    global.fetch = realFetch;
    jest.restoreAllMocks();
  });

  it('keeps the new session in __Host- cookies that only this host can set', async () => {
    const jar = fakeCookieStore({
      [OAUTH_STATE_COOKIE]: 'state-1',
      [OAUTH_CODE_VERIFIER_COOKIE]: 'verifier-1',
    });
    (cookies as jest.Mock).mockResolvedValue(jar.store);

    const response = await GET(
      new NextRequest('https://admin.yildizskylab.com/api/auth/callback?code=code-1&state=state-1'),
    );

    expect(new URL(response.headers.get('location')!).pathname).toBe('/dashboard');
    const session = { secure: true, httpOnly: true, sameSite: 'lax', path: '/' };
    expect(jar.sent('__Host-auth_token')).toEqual({
      ...session,
      value: 'access-1',
      maxAge: 604800,
    });
    expect(jar.sent('__Host-access_token')).toEqual({
      ...session,
      value: 'access-1',
      maxAge: 604800,
    });
    expect(jar.sent('__Host-refresh_token')).toEqual({
      ...session,
      value: 'refresh-1',
      maxAge: 2592000,
    });
  });
});
