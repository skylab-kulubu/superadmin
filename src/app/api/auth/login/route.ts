import { NextResponse } from 'next/server';
import { getOAuth2AuthUrl } from '@/lib/auth/oauth2';

export async function GET() {
  const authUrl = getOAuth2AuthUrl();
  return NextResponse.redirect(authUrl);
}

 