import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { getUsers } from './actions';
import { UsersGridClient } from './UsersGridClient';
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

  // Kullanıcıları gruplara göre dağıt
  const usersByGroup: Record<string, UserDto[]> = {
    ADMIN: [],
    YONETIM: [], // YK + DK
    AGC: [], // AGC_ADMIN + AGC_LEADER
    GECEKODU: [], // GECEKODU_ADMIN + GECEKODU_LEADER
    BIZBIZE: [], // BIZBIZE_ADMIN + BIZBIZE_LEADER
    USER: [],
  };

  users.forEach(user => {
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
          actions={(
            <Link href="/users/new">
              <Button>
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Yeni Kullanıcı
                </span>
              </Button>
            </Link>
          )}
        />

        {/* Error State */}
        {error ? (
          <div className="bg-light border-l-4 border-danger rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-danger-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-danger-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-danger-800 mb-2">Hata Oluştu</h2>
                <p className="text-dark-700 mb-4">{error}</p>
            {error.includes('403') || error.includes('yetkiniz') ? (
                  <div className="space-y-3">
                    <p className="text-sm text-dark-600">Bu sayfayı görüntülemek için gerekli yetkiniz bulunmamaktadır.</p>
                {currentUser && (
                      <div className="mt-3 p-4 bg-light rounded-lg border border-dark-200">
                        <p className="font-semibold mb-2 text-dark-800">Mevcut Rolleriniz:</p>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {currentUser.roles.length > 0 ? (
                            currentUser.roles.map((role, idx) => (
                              <span key={idx} className="px-2.5 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700 border border-purple-200/50">
                                {role}
                              </span>
                            ))
                          ) : (
                            <span className="text-dark-500 text-sm">Rol atanmamış</span>
                          )}
                        </div>
                        <p className="mt-2 text-xs text-dark-500">
                          Bu sayfa için muhtemelen <strong className="text-dark-700">ADMIN</strong> veya <strong className="text-dark-700">USER_MANAGER</strong> rolü gerekmektedir.
                    </p>
                  </div>
                )}
                    <p className="text-sm text-dark-600">Lütfen yöneticinizle iletişime geçin.</p>
              </div>
            ) : (
                  <p className="text-sm text-dark-600">Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.</p>
            )}
              </div>
            </div>
          </div>
        ) : users.length === 0 ? (
          /* Empty State */
          <div className="bg-light border border-dark-200 rounded-lg p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-dark-800 mb-2">Henüz kullanıcı yok</h3>
              <p className="text-dark-600 mb-6">Sisteme ilk kullanıcıyı ekleyerek başlayın</p>
              <Link href="/users/new">
                <Button>
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
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

