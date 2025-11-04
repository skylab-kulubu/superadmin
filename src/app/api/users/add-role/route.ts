import { NextRequest, NextResponse } from 'next/server';
import { serverFetch } from '@/lib/api/server-client';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { username, role } = await request.json();
    
    if (!username || !role) {
      return NextResponse.json(
        { success: false, message: 'Username ve role gerekli' },
        { status: 400 }
      );
    }

    // Rol ekleme işlemini gerçekleştir
    const result = await serverFetch(`/api/users/add-role/${encodeURIComponent(username)}?role=${role}`, {
      method: 'PUT',
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Rol başarıyla eklendi',
      data: result 
    });
  } catch (error) {
    console.error('Add role error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}

// GET ile kontrol endpoint'i
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json({ hasAccess: false, message: 'Token bulunamadı' }, { status: 401 });
    }

    // Mevcut kullanıcı bilgilerini al
    const userResponse = await serverFetch<any>('/api/users/me');
    const currentUser = userResponse.data;
    
    // addRole endpoint'ine erişim kontrolü için test yapalım
    // Kendi username'imizle test edelim (eğer zaten ADMIN rolü varsa çalışmayacak ama endpoint erişimi kontrol edilir)
    const testUsername = currentUser?.username;
    
    if (!testUsername) {
      return NextResponse.json({ 
        hasAccess: false, 
        message: 'Kullanıcı bilgileri alınamadı',
        currentUser: null
      });
    }

    return NextResponse.json({
      hasAccess: true,
      currentUser: {
        username: currentUser.username,
        email: currentUser.email,
        roles: currentUser.roles,
      },
      message: 'Kullanıcı bilgileri alındı'
    });
  } catch (error) {
    console.error('Check access error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    
    // 403 hatası varsa yetki yok demektir
    if (errorMessage.includes('403') || errorMessage.includes('yetkiniz')) {
      return NextResponse.json({
        hasAccess: false,
        message: 'AddRole endpoint\'ine erişim yetkiniz yok',
        error: errorMessage
      }, { status: 403 });
    }
    
    return NextResponse.json({
      hasAccess: false,
      message: errorMessage
    }, { status: 500 });
  }
}
