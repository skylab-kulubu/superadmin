import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import type { DataResult, UserDto } from '@/types/api';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // Token geçerliliğini backend'de kontrol et
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.yildizskylab.com';
    const response = await fetch(`${API_BASE_URL}/api/users/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Token geçersizse cookie'yi temizle
      cookieStore.delete('auth_token');
      cookieStore.delete('refresh_token');
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const backendResponse: DataResult<UserDto> = await response.json();
    
    // Backend DataResult formatında dönüyor, sadece data kısmını gönder
    return NextResponse.json({ 
      authenticated: true, 
      user: backendResponse.data 
    });
  } catch (error) {
    console.error('Auth me error:', error);
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}

