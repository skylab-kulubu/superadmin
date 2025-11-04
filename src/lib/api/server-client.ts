import { cookies } from 'next/headers';
import { apiClient } from './client';
import { refreshAccessToken } from '@/lib/auth/oauth2';

export async function getApiClient() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  
  if (token) {
    apiClient.setToken(token);
  }
  
  return apiClient;
}

// Server-side için özel fetch wrapper
export async function serverFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const cookieStore = await cookies();
  let token = cookieStore.get('auth_token')?.value;
  
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.yildizskylab.com';
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    console.error('⚠️ Token bulunamadı! Cookie:', cookieStore.getAll().map(c => c.name));
  }
  
  let response = await fetch(url, {
    ...options,
    headers,
    // Server-side'da credentials include gerekmez, cookie'ler otomatik gönderilmez
  });
  
  // 401 Unauthorized - Token expire olmuş, refresh token ile yenile
  if (response.status === 401) {
    const wwwAuthenticate = response.headers.get('www-authenticate') || '';
    const isTokenExpired = wwwAuthenticate.includes('expired') || wwwAuthenticate.includes('invalid_token');
    
    if (isTokenExpired) {
      const refreshToken = cookieStore.get('refresh_token')?.value;
      
      if (refreshToken) {
        try {
          console.log('🔄 Token yenileniyor...');
          const { access_token, refresh_token: newRefreshToken } = await refreshAccessToken(refreshToken);
          
          // Yeni token'ları cookie'ye kaydet
          cookieStore.set('auth_token', access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7,
          });
          
          if (newRefreshToken) {
            cookieStore.set('refresh_token', newRefreshToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              maxAge: 60 * 60 * 24 * 30,
            });
          }
          
          // Yeni token ile isteği tekrar gönder
          headers['Authorization'] = `Bearer ${access_token}`;
          response = await fetch(url, {
            ...options,
            headers,
          });
          
          console.log('✅ Token yenilendi, istek tekrar gönderildi');
        } catch (refreshError) {
          console.error('❌ Token yenileme başarısız:', refreshError);
          // Refresh token da geçersizse cookie'leri temizle
          cookieStore.delete('auth_token');
          cookieStore.delete('refresh_token');
          throw new Error('Oturum süreniz doldu. Lütfen tekrar giriş yapın.');
        }
      } else {
        console.error('⚠️ Refresh token bulunamadı');
        cookieStore.delete('auth_token');
        throw new Error('Oturum süreniz doldu. Lütfen tekrar giriş yapın.');
      }
    }
  }
  
  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `HTTP ${response.status}`;
    let errorDetails: any = { status: response.status, statusText: response.statusText };
    
    try {
      const errorJson = errorText ? JSON.parse(errorText) : {};
      errorMessage = errorJson.message || errorMessage;
      errorDetails = { ...errorDetails, ...errorJson };
    } catch {
      errorDetails.body = errorText || 'Boş response';
    }
    
    // 502 Bad Gateway - Backend servisi çalışmıyor veya erişilemiyor
    if (response.status === 502) {
      console.error('❌ 502 Bad Gateway - Backend servisi çalışmıyor olabilir:', {
        endpoint,
        url,
        errorDetails,
      });
      errorMessage = 'Backend servisi şu anda erişilebilir değil. Lütfen daha sonra tekrar deneyin.';
    }
    
    // 403 hatası için özel mesaj
    if (response.status === 403) {
      console.error('❌ 403 Forbidden - Yetki sorunu:', {
        endpoint,
        hasToken: !!token,
        tokenLength: token?.length,
        errorDetails,
      });
      errorMessage = 'Bu işlem için yetkiniz bulunmamaktadır';
    }
    
    console.error('API Error:', {
      url,
      status: response.status,
      errorDetails,
      headers: Object.fromEntries(response.headers.entries()),
    });
    
    throw new Error(errorMessage);
  }
  
  // Response boş olabilir (DELETE gibi işlemlerde)
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    return {} as T;
  }
  
  const text = await response.text();
  if (!text || text.trim() === '') {
    return {} as T;
  }
  
  try {
    return JSON.parse(text);
  } catch (parseError) {
    console.error('JSON Parse Error:', {
      url,
      text: text.substring(0, 200),
      error: parseError,
    });
    throw new Error(`Geçersiz JSON yanıtı: ${parseError instanceof Error ? parseError.message : 'Bilinmeyen hata'}`);
  }
}

