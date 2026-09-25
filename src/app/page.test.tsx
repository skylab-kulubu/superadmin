/** @jest-environment node */

import { cookies } from 'next/headers';
import RootPage from '@/app/page';
import { fakeCookieStore } from '@/test/server/cookie-store';

jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

// Like Next's own redirect(), this stops rendering by throwing.
jest.mock('next/navigation', () => ({
  redirect: (url: string) => {
    throw Object.assign(new Error('redirect'), { url });
  },
}));

async function redirectTarget(requestCookies: Record<string, string>): Promise<string> {
  (cookies as jest.Mock).mockResolvedValue(fakeCookieStore(requestCookies).store);
  try {
    await RootPage();
  } catch (error) {
    return (error as { url: string }).url;
  }
  throw new Error('RootPage did not redirect');
}

describe('RootPage', () => {
  const env = { ...process.env };

  beforeEach(() => {
    process.env.AUTH_COOKIE_SECURE = 'true';
  });

  afterEach(() => {
    process.env = { ...env };
  });

  it('sends an admin whose session is only in legacy unprefixed cookies to /login', async () => {
    expect(await redirectTarget({ auth_token: 'old-access', refresh_token: 'old-refresh' })).toBe(
      '/login',
    );
  });

  it('sends an admin with a __Host- refresh cookie on to the dashboard', async () => {
    expect(await redirectTarget({ '__Host-refresh_token': 'refresh-1' })).toBe('/dashboard');
  });
});
