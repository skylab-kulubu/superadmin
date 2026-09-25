/** @jest-environment node */

import { cookies } from 'next/headers';
import { GET } from '@/app/api/auth/token/route';
import { fakeCookieStore } from '@/test/server/cookie-store';

jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

function accessToken(expiresInSeconds = 300): string {
  const header = Buffer.from(JSON.stringify({ alg: 'none' })).toString('base64url');
  const body = Buffer.from(
    JSON.stringify({ sub: 'admin-1', exp: Math.floor(Date.now() / 1000) + expiresInSeconds }),
  ).toString('base64url');
  return `${header}.${body}.sig`;
}

/** Stands in for Keycloak's token endpoint on the network boundary. */
function fakeKeycloak(answer: { access_token: string; refresh_token: string }): jest.Mock {
  const tokenEndpoint = jest.fn(async () => Response.json(answer));
  global.fetch = tokenEndpoint as unknown as typeof fetch;
  return tokenEndpoint;
}

describe('GET /api/auth/token', () => {
  const env = { ...process.env };
  const realFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.AUTH_COOKIE_SECURE = 'true';
    process.env.OAUTH2_ISSUER = 'https://e.yildizskylab.com/realms/e-skylab';
    process.env.OAUTH2_CLIENT_ID = 'superadmin';
  });

  afterEach(() => {
    process.env = { ...env };
    global.fetch = realFetch;
  });

  it('answers 401 without refreshing when only legacy unprefixed session cookies are present', async () => {
    const jar = fakeCookieStore({ auth_token: accessToken(), refresh_token: 'planted-refresh' });
    (cookies as jest.Mock).mockResolvedValue(jar.store);
    const tokenEndpoint = fakeKeycloak({ access_token: accessToken(), refresh_token: 'refresh-2' });

    const response = await GET();

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ token: null });
    expect(tokenEndpoint).not.toHaveBeenCalled();
  });

  it('refreshes an expired session and keeps the rotated tokens in __Host- cookies', async () => {
    const fresh = accessToken();
    const jar = fakeCookieStore({
      '__Host-auth_token': accessToken(-60),
      '__Host-refresh_token': 'refresh-1',
    });
    (cookies as jest.Mock).mockResolvedValue(jar.store);
    fakeKeycloak({ access_token: fresh, refresh_token: 'refresh-2' });

    const response = await GET();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ token: fresh });
    const session = { secure: true, httpOnly: true, sameSite: 'lax', path: '/' };
    expect(jar.sent('__Host-auth_token')).toEqual({ ...session, value: fresh, maxAge: 604800 });
    expect(jar.sent('__Host-access_token')).toEqual({ ...session, value: fresh, maxAge: 604800 });
    expect(jar.sent('__Host-refresh_token')).toEqual({
      ...session,
      value: 'refresh-2',
      maxAge: 2592000,
    });
  });
});
