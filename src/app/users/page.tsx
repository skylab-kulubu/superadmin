import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { getUsers } from './actions';
import { UsersGridClient } from './UsersGridClient';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import type { UserDto } from '@/types/api';
import { serverFetch } from '@/lib/api/server-client';
import type { DataResult, UserDto as UserDtoType } from '@/types/api';

export const dynamic = 'force-dynamic';

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

  // Kullanıcıları gruplara göre dağıt
  const usersByGroup: Record<string, UserDto[]> = {
    ADMIN: [],
    YONETIM: [], // YK + DK
    AGC: [], // AGC_ADMIN + AGC_LEADER
    GECEKODU: [], // GECEKODU_ADMIN + GECEKODU_LEADER
    BIZBIZE: [], // BIZBIZE_ADMIN + BIZBIZE_LEADER
    USER: [],
  };

  users.forEach((user) => {
    const roles = user.roles || [];

    if (roles.includes('ADMIN')) {
      usersByGroup.ADMIN.push(user);
    } else if (roles.includes('YK') || roles.includes('DK')) {
      usersByGroup.YONETIM.push(user);
    } else if (roles.includes('AGC_ADMIN') || roles.includes('AGC_LEADER')) {
      usersByGroup.AGC.push(user);
    } else if (roles.includes('GECEKODU_ADMIN') || roles.includes('GECEKODU_LEADER')) {
      usersByGroup.GECEKODU.push(user);
    } else if (roles.includes('BIZBIZE_ADMIN') || roles.includes('BIZBIZE_LEADER')) {
      usersByGroup.BIZBIZE.push(user);
    } else {
      usersByGroup.USER.push(user);
    }
  });

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="Kullanıcılar"
          description="Sistemdeki tüm kullanıcıları görüntüleyin ve yönetin"
          actions={
            <Link href="/users/new">
              <Button>
                <span className="flex items-center gap-2">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Yeni Kullanıcı
                </span>
              </Button>
            </Link>
          }
        />

        {/* Error State */}
        {error ? (
          <div className="bg-light border-danger rounded-lg border-l-4 p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="bg-danger-100 flex h-10 w-10 items-center justify-center rounded-full">
                  <svg
                    className="text-danger-700 h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-danger-800 mb-2 text-lg font-semibold">Hata Oluştu</h2>
                <p className="text-dark-700 mb-4">{error}</p>
                {error.includes('403') || error.includes('yetkiniz') ? (
                  <div className="space-y-3">
                    <p className="text-dark-600 text-sm">
                      Bu sayfayı görüntülemek için gerekli yetkiniz bulunmamaktadır.
                    </p>
                    {currentUser && (
                      <div className="bg-light border-dark-200 mt-3 rounded-lg border p-4">
                        <p className="text-dark-800 mb-2 font-semibold">Mevcut Rolleriniz:</p>
                        <div className="mb-2 flex flex-wrap gap-2">
                          {currentUser.roles.length > 0 ? (
                            currentUser.roles.map((role, idx) => (
                              <span
                                key={idx}
                                className="rounded-full border border-purple-200/50 bg-purple-100 px-2.5 py-1 text-xs font-medium text-purple-700"
                              >
                                {role}
                              </span>
                            ))
                          ) : (
                            <span className="text-dark-500 text-sm">Rol atanmamış</span>
                          )}
                        </div>
                        <p className="text-dark-500 mt-2 text-xs">
                          Bu sayfa için muhtemelen <strong className="text-dark-700">ADMIN</strong>{' '}
                          veya <strong className="text-dark-700">USER_MANAGER</strong> rolü
                          gerekmektedir.
                        </p>
                      </div>
                    )}
                    <p className="text-dark-600 text-sm">Lütfen yöneticinizle iletişime geçin.</p>
                  </div>
                ) : (
                  <p className="text-dark-600 text-sm">
                    Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : users.length === 0 ? (
          /* Empty State */
          <div className="bg-light border-dark-200 rounded-lg border p-12 text-center">
            <div className="mx-auto max-w-md">
              <div className="bg-brand-100 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <svg
                  className="text-brand-600 h-8 w-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-dark-800 mb-2 text-xl font-semibold">Henüz kullanıcı yok</h3>
              <p className="text-dark-600 mb-6">Sisteme ilk kullanıcıyı ekleyerek başlayın</p>
              <Link href="/users/new">
                <Button>
                  <span className="flex items-center gap-2">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    İlk Kullanıcıyı Ekle
                  </span>
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          /* Users Grid by Role */
          <UsersGridClient usersByGroup={usersByGroup} />
        )}
      </div>
    </AppShell>
  );
}
