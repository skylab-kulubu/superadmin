import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isJwtExpired } from '@/lib/auth/jwt-expiry';
import { refreshAccessToken } from '@/lib/auth/oauth2';
import {
  readSessionAccessToken,
  readSessionRefreshToken,
  writeSessionCookies,
} from '@/lib/auth/session-cookies';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = readSessionAccessToken(cookieStore);

    if (token && !isJwtExpired(token)) {
      return NextResponse.json({ token });
    }

    // Access token yoksa refresh token ile sessizce yenilemeyi dene.
    const refreshToken = readSessionRefreshToken(cookieStore);
    if (!refreshToken) {
      return NextResponse.json({ token: null }, { status: 401 });
    }

    const { access_token, refresh_token } = await refreshAccessToken(refreshToken);
    writeSessionCookies(cookieStore, access_token, refresh_token);

    return NextResponse.json({ token: access_token });
  } catch (error) {
    return NextResponse.json({ token: null }, { status: 401 });
  }
}
