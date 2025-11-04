import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import type { DataResult, UserDto } from '@/types/api';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      console.log('⚠️ /api/auth/me: Token bulunamadı');
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    console.log('✅ /api/auth/me: Token bulundu, uzunluk:', token.length);

    // Token geçerliliğini backend'de kontrol et
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.yildizskylab.com';
    const response = await fetch(`${API_BASE_URL}/api/users/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // 502 Bad Gateway - Backend'e erişilemiyor
      if (response.status === 502) {
        console.error('❌ /api/auth/me: Backend 502 Bad Gateway - Backend servisi çalışmıyor olabilir');
        // Backend down olsa bile token geçerli olabilir, bu yüzden authenticated: true döndür ama user bilgisi olmadan
        return NextResponse.json({ 
          authenticated: true, 
          user: null,
          error: 'Backend servisi şu anda erişilebilir değil. Lütfen daha sonra tekrar deneyin.'
        }, { status: 200 });
      }
      
      console.error('❌ /api/auth/me: Backend yanıtı başarısız:', response.status, response.statusText);
      // Token geçersizse cookie'yi temizle
      cookieStore.delete('auth_token');
      cookieStore.delete('refresh_token');
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const backendResponse: DataResult<UserDto> = await response.json();
    
    console.log('✅ /api/auth/me: Backend yanıtı başarılı, user:', backendResponse.data?.username);
    
    // Backend DataResult formatında dönüyor, sadece data kısmını gönder
    return NextResponse.json({ 
      authenticated: true, 
      user: backendResponse.data 
    });
  } catch (error) {
    console.error('❌ /api/auth/me: Hata:', error);
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}

