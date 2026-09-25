import { RequestCookies, ResponseCookies } from 'next/dist/server/web/spec-extension/cookies';

/** What a browser learns about one cookie from a response's Set-Cookie line. */
export type SentCookie = {
  value: string;
  path?: string;
  domain?: string;
  maxAge?: number;
  secure: boolean;
  httpOnly: boolean;
  sameSite?: string;
};

function parseSetCookie(line: string): [string, SentCookie] {
  const [pair, ...attributes] = line.split('; ');
  const splitAt = pair.indexOf('=');
  const cookie: SentCookie = {
    value: decodeURIComponent(pair.slice(splitAt + 1)),
    secure: false,
    httpOnly: false,
  };
  for (const attribute of attributes) {
    const [key, value] = attribute.split('=');
    switch (key.toLowerCase()) {
      case 'path':
        cookie.path = value;
        break;
      case 'domain':
        cookie.domain = value;
        break;
      case 'max-age':
        cookie.maxAge = Number(value);
        break;
      case 'secure':
        cookie.secure = true;
        break;
      case 'httponly':
        cookie.httpOnly = true;
        break;
      case 'samesite':
        cookie.sameSite = value;
        break;
    }
  }
  return [pair.slice(0, splitAt), cookie];
}

/**
 * Stands in for `cookies()` from next/headers inside a route handler. Reads come from the
 * request's Cookie header; writes go through Next's own ResponseCookies, so a test sees the exact
 * Set-Cookie lines the browser would receive.
 */
export function fakeCookieStore(requestCookies: Record<string, string> = {}) {
  const requestHeaders = new Headers();
  const cookieHeader = Object.entries(requestCookies)
    .map(([name, value]) => `${name}=${value}`)
    .join('; ');
  if (cookieHeader) requestHeaders.set('cookie', cookieHeader);
  const received = new RequestCookies(requestHeaders);
  const responseHeaders = new Headers();
  const response = new ResponseCookies(responseHeaders);

  const store = {
    get: (name: string) => received.get(name),
    getAll: () => received.getAll(),
    has: (name: string) => received.has(name),
    set: (...args: Parameters<ResponseCookies['set']>) => {
      response.set(...args);
      return store;
    },
    delete: (...args: Parameters<ResponseCookies['delete']>) => {
      response.delete(...args);
      return store;
    },
  };

  const sent = () => new Map(responseHeaders.getSetCookie().map(parseSetCookie));

  return {
    store,
    /** The cookie this response sets (or expires) under `name`, as the browser reads it. */
    sent: (name: string) => sent().get(name),
    /** Every cookie name this response sets or expires. */
    sentNames: () => [...sent().keys()],
  };
}
