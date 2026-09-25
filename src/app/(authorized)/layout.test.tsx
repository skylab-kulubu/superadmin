/** @jest-environment node */

import { cookies } from 'next/headers';
import AuthorizedLayout from '@/app/(authorized)/layout';
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

function accessToken(): string {
  const header = Buffer.from(JSON.stringify({ alg: 'none' })).toString('base64url');
  const body = Buffer.from(
    JSON.stringify({ sub: 'admin-1', exp: Math.floor(Date.now() / 1000) + 300 }),
  ).toString('base64url');
  return `${header}.${body}.sig`;
}

async function redirectTarget(requestCookies: Record<string, string>): Promise<string | null> {
  (cookies as jest.Mock).mockResolvedValue(fakeCookieStore(requestCookies).store);
  try {
    await AuthorizedLayout({ children: null });
  } catch (error) {
    return (error as { url: string }).url;
  }
  return null;
}

describe('AuthorizedLayout', () => {
  const env = { ...process.env };

  beforeEach(() => {
    process.env.AUTH_COOKIE_SECURE = 'true';
  });

  afterEach(() => {
    process.env = { ...env };
  });

  it('sends an admin whose session is only in a legacy unprefixed cookie to /login', async () => {
    expect(await redirectTarget({ auth_token: accessToken() })).toBe('/login');
  });

  it('renders for an admin with a __Host- session cookie', async () => {
    expect(await redirectTarget({ '__Host-auth_token': accessToken() })).toBeNull();
  });
});
