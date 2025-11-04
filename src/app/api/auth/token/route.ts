import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ token: null }, { status: 401 });
    }

    // Token'ı client'a gönder (güvenlik için sadece token'ı gönderiyoruz)
    return NextResponse.json({ token });
  } catch (error) {
    return NextResponse.json({ token: null }, { status: 401 });
  }
}

