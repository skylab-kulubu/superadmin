import { NextResponse } from 'next/server';
import { ALLOWED_ROLES, ASSIGNABLE_ROLES_BY_ROLE } from '@/config/roles';
import { serverFetch } from '@/lib/api/server-client';

// GET endpoint'ini dinamik hale getiriyoruz
export async function GET() {
  try {
    // 1. Statik Rolleri Al
    const staticRoles = new Set<string>(ALLOWED_ROLES as unknown as string[]);

    // 2. Dinamik Rolleri Backend'den Çek (Gruplar)
    try {
      // Backend'de grupları listeleyen bir endpoint var mı?
      // Genelde /api/groups/ listeler. Yoksa bile catch'e düşer, statiklerle devam eder.
      // Not: Kullanıcının token'ı ile istek atıldığı için serverFetch kullanıyoruz.
      const groupsResponse = await serverFetch<any>('/api/groups/');

      if (groupsResponse?.success && Array.isArray(groupsResponse.data)) {
        groupsResponse.data.forEach((group: any) => {
          // Backend'den dönen obje yapısını tam bilmiyoruz, olası key'leri kontrol edelim
          const roleName = group.name || group.groupName || group.roleName;
          if (roleName) {
            staticRoles.add(roleName);
          }
        });
      }
    } catch (error) {
      console.warn(
        'Dinamik roller (gruplar) çekilemedi, sadece statik roller kullanılıyor:',
        error,
      );
    }

    // 3. Mevcut kullanıcının yetkilerini kontrol et
    // Mevcut kullanıcının rollerini alıp atanabilir listeyi daraltalım
    let currentUserRoles: string[] = [];
    try {
      const me = await serverFetch<any>('/api/users/me');
      currentUserRoles = me?.data?.roles ?? [];
    } catch {
      // Yetkisiz ise boş bırak
    }

    // Backend kuralı: Role atama sadece ADMIN tarafından yapılabilir (şimdilik)
    // Eğer ileride logic değişirse burayı güncelleyebiliriz.
    if (!currentUserRoles.includes('ADMIN')) {
      return NextResponse.json({ roles: [] });
    }

    return NextResponse.json({ roles: Array.from(staticRoles) });
  } catch (e) {
    console.error('Roller servisinde hata:', e);
    // Hata durumunda en azından statik listeyi dön
    return NextResponse.json({ roles: ALLOWED_ROLES }, { status: 200 });
  }
}
