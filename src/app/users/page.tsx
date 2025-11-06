import { AppShell } from '@/components/layout/AppShell';
import { getUsers } from './actions';
import { UsersTableClient } from './UsersTableClient';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import type { UserDto } from '@/types/api';
import { serverFetch } from '@/lib/api/server-client';
import type { DataResult, UserDto as UserDtoType } from '@/types/api';

export default async function UsersPage() {
  let users: UserDto[] = [];
  let error: string | null = null;
  let currentUser: UserDtoType | null = null;

  // Mevcut kullanıcının bilgilerini al
  try {
    const userResponse = await serverFetch<DataResult<UserDtoType>>('/api/users/me');
    currentUser = userResponse.data;
  } catch (err) {
    console.error('Failed to get current user:', err);
  }

  try {
    users = await getUsers();
  } catch (err) {
    error = err instanceof Error ? err.message : 'Kullanıcılar yüklenirken hata oluştu';
    console.error('Users page error:', err);
  }

  // Roles'i string'e çevir (server-side'da)
  const usersWithFormattedRoles = users.map(user => ({
    ...user,
    rolesString: user.roles.join(', '),
  }));

  return (
    <AppShell>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-yesil">Kullanıcılar</h1>
          <Link href="/users/new">
            <Button>Yeni Kullanıcı</Button>
          </Link>
        </div>

        {error ? (
          <div className="bg-lacivert border border-pembe-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-yesil mb-2">Hata</h2>
            <p className="text-pembe mb-4">{error}</p>
            {error.includes('403') || error.includes('yetkiniz') ? (
              <div className="text-sm text-pembe">
                <p className="mb-2">Bu sayfayı görüntülemek için gerekli yetkiniz bulunmamaktadır.</p>
                {currentUser && (
                  <div className="mt-3 p-3 bg-lacivert rounded border border-pembe-200">
                    <p className="font-semibold mb-1 text-pembe">Mevcut Rolleriniz:</p>
                    <p className="text-pembe">{currentUser.roles.join(', ') || 'Rol atanmamış'}</p>
                    <p className="mt-2 text-xs text-pembe opacity-60">
                      Bu sayfa için muhtemelen <strong>ADMIN</strong> veya <strong>USER_MANAGER</strong> rolü gerekmektedir.
                    </p>
                  </div>
                )}
                <p className="mt-3 text-pembe">Lütfen yöneticinizle iletişime geçin.</p>
              </div>
            ) : (
              <p className="text-sm text-pembe">Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.</p>
            )}
          </div>
        ) : users.length === 0 ? (
          <div className="bg-lacivert border border-pembe-200 rounded-lg p-6 text-center">
            <p className="text-pembe opacity-60">Henüz kullanıcı bulunmamaktadır.</p>
          </div>
        ) : (
          <UsersTableClient data={usersWithFormattedRoles as any} />
        )}
      </div>
    </AppShell>
  );
}

