import { authCookieSecure } from '@/lib/auth/cookie-secure';

/**
 * The admin session's cookie names. When the cookies are Secure they carry the `__Host-` prefix:
 * the browser then accepts them only from this host, Secure, with `Path=/` and no `Domain`, so a
 * sibling subdomain under yildizskylab.com cannot plant or shadow them. Local http cannot use the
 * prefix (it requires Secure), so there the names stay plain.
 */
export function sessionCookieNames() {
  const prefix = authCookieSecure() ? '__Host-' : '';
  return {
    authToken: `${prefix}auth_token`,
    accessToken: `${prefix}access_token`,
    refreshToken: `${prefix}refresh_token`,
  };
}

/** Anything that reads request cookies: `cookies()` from next/headers or `NextRequest.cookies`. */
type CookieReader = { get(name: string): { value: string } | undefined };

/**
 * The session's access token. Only the current names count: an unprefixed cookie is ignored when
 * the session is Secure, because a sibling subdomain could have planted it.
 */
export function readSessionAccessToken(cookies: CookieReader): string | null {
  const names = sessionCookieNames();
  return cookies.get(names.authToken)?.value || cookies.get(names.accessToken)?.value || null;
}

/** The session's refresh token, under the current name only (see `readSessionAccessToken`). */
export function readSessionRefreshToken(cookies: CookieReader): string | null {
  return cookies.get(sessionCookieNames().refreshToken)?.value || null;
}

const ACCESS_TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
const REFRESH_TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

type SessionCookieOptions = {
  httpOnly: true;
  secure: boolean;
  sameSite: 'lax';
  path: '/';
  maxAge: number;
  expires?: Date;
};

/** Anything that writes response cookies: `cookies()` from next/headers in a route handler. */
type CookieWriter = { set(name: string, value: string, options: SessionCookieOptions): unknown };

function sessionCookieOptions(maxAge: number): SessionCookieOptions {
  return { httpOnly: true, secure: authCookieSecure(), sameSite: 'lax', path: '/', maxAge };
}

/** Stores a (new or refreshed) session: the access token twice, as before, and the refresh token. */
export function writeSessionCookies(
  cookies: CookieWriter,
  accessToken: string,
  refreshToken: string,
): void {
  const names = sessionCookieNames();
  cookies.set(names.authToken, accessToken, sessionCookieOptions(ACCESS_TOKEN_MAX_AGE_SECONDS));
  cookies.set(names.accessToken, accessToken, sessionCookieOptions(ACCESS_TOKEN_MAX_AGE_SECONDS));
  cookies.set(
    names.refreshToken,
    refreshToken,
    sessionCookieOptions(REFRESH_TOKEN_MAX_AGE_SECONDS),
  );
}

/** Names the session used before the `__Host-` prefix (`token` was read but never issued). */
const LEGACY_SESSION_COOKIE_NAMES = ['auth_token', 'access_token', 'refresh_token', 'token'];

/**
 * Ends the session in the browser: expires the current cookies and the legacy unprefixed ones so
 * they do not linger. Each is overwritten with a Secure, `Path=/` cookie: a bare `delete()` omits
 * Secure, and the browser ignores such a Set-Cookie for a `__Host-` name.
 */
export function clearSessionCookies(cookies: CookieWriter): void {
  const names = new Set([...Object.values(sessionCookieNames()), ...LEGACY_SESSION_COOKIE_NAMES]);
  for (const name of names) {
    cookies.set(name, '', { ...sessionCookieOptions(0), expires: new Date(0) });
  }
}
