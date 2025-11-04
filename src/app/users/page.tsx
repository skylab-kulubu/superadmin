import { AppShell } from '@/components/layout/AppShell';
import { getUsers } from './actions';
import { DataTable } from '@/components/tables/DataTable';
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
          <h1 className="text-2xl font-bold">Kullanıcılar</h1>
          <Link href="/users/new">
            <Button>Yeni Kullanıcı</Button>
          </Link>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Hata</h2>
            <p className="text-red-700 mb-4">{error}</p>
            {error.includes('403') || error.includes('yetkiniz') ? (
              <div className="text-sm text-red-600">
                <p className="mb-2">Bu sayfayı görüntülemek için gerekli yetkiniz bulunmamaktadır.</p>
                {currentUser && (
                  <div className="mt-3 p-3 bg-white rounded border border-red-200">
                    <p className="font-semibold mb-1">Mevcut Rolleriniz:</p>
                    <p className="text-gray-700">{currentUser.roles.join(', ') || 'Rol atanmamış'}</p>
                    <p className="mt-2 text-xs text-gray-600">
                      Bu sayfa için muhtemelen <strong>ADMIN</strong> veya <strong>USER_MANAGER</strong> rolü gerekmektedir.
                    </p>
                  </div>
                )}
                <p className="mt-3">Lütfen yöneticinizle iletişime geçin.</p>
              </div>
            ) : (
              <p className="text-sm text-red-600">Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.</p>
            )}
          </div>
        ) : users.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
            <p className="text-gray-600">Henüz kullanıcı bulunmamaktadır.</p>
          </div>
        ) : (
          <DataTable
            data={usersWithFormattedRoles}
            columns={[
              { key: 'firstName', header: 'Ad' },
              { key: 'lastName', header: 'Soyad' },
              { key: 'email', header: 'Email' },
              { key: 'username', header: 'Kullanıcı Adı' },
              { key: 'rolesString', header: 'Roller' },
            ]}
            idKey="id"
          />
        )}
      </div>
    </AppShell>
  );
}

