/** @jest-environment node */

import { sessionCookieNames } from '@/lib/auth/session-cookies';

describe('session cookie names', () => {
  const secureSetting = process.env.AUTH_COOKIE_SECURE;

  afterEach(() => {
    if (secureSetting === undefined) delete process.env.AUTH_COOKIE_SECURE;
    else process.env.AUTH_COOKIE_SECURE = secureSetting;
  });

  it('carry the __Host- prefix when session cookies are Secure, so no sibling subdomain can plant or shadow them', () => {
    process.env.AUTH_COOKIE_SECURE = 'true';

    expect(sessionCookieNames()).toEqual({
      authToken: '__Host-auth_token',
      accessToken: '__Host-access_token',
      refreshToken: '__Host-refresh_token',
    });
  });

  it('stay plain on local http, where a browser refuses __Host- cookies', () => {
    process.env.AUTH_COOKIE_SECURE = 'false';

    expect(sessionCookieNames()).toEqual({
      authToken: 'auth_token',
      accessToken: 'access_token',
      refreshToken: 'refresh_token',
    });
  });
});
