import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForToken } from '@/lib/auth/oauth2';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    console.error('OAuth error:', error);
    return NextResponse.redirect(new URL('/login?error=' + encodeURIComponent(error), request.url));
  }

  if (!code) {
    console.error('No authorization code provided');
    return NextResponse.redirect(new URL('/login?error=no_code', request.url));
  }

  try {
    const { access_token, refresh_token } = await exchangeCodeForToken(code);
    
    // Next.js 15'te cookies() async olmalı
    const cookieStore = await cookies();
    
    cookieStore.set('auth_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });

    cookieStore.set('refresh_token', refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
    });

    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (error) {
    console.error('Token exchange failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'unknown_error';
    return NextResponse.redirect(new URL('/login?error=token_exchange_failed&details=' + encodeURIComponent(errorMessage), request.url));
  }
}

