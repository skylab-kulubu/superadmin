'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
// import { Modal } from '@/components/ui/Modal';
import { usersApi } from '@/lib/api/users';
import type { UpdateUserRequest, UserDto } from '@/types/api';
// Roller dinamik olarak /api/roles üzerinden yüklenecek

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [user, setUser] = useState<UserDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editData, setEditData] = useState<UpdateUserRequest>({
    firstName: '',
    lastName: '',
    linkedin: '',
    university: '',
    faculty: '',
    department: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const loadUser = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await usersApi.getById(id);
      if (response.success && response.data) {
        setUser(response.data);
        setEditData({
          firstName: response.data.firstName || '',
          lastName: response.data.lastName || '',
          linkedin: response.data.linkedin || '',
          university: response.data.university || '',
          faculty: response.data.faculty || '',
          department: response.data.department || '',
        });
        setSelectedRoles(response.data.roles || []);
      } else {
        setError('Kullanıcı bulunamadı');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kullanıcı yüklenirken hata oluştu');
      console.error('User fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadUser();
    }
  }, [id]);

  // Rolleri yükle
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/roles', { cache: 'no-store' });
        const json = await res.json();
        setAvailableRoles(Array.isArray(json?.roles) ? json.roles : []);
      } catch {
        setAvailableRoles([]);
      }
    })();
  }, []);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await usersApi.update(user.id, editData);
      // Role changes
      const current = new Set(user.roles || []);
      const selected = new Set(selectedRoles);
      const toAdd: string[] = [];
      const toRemove: string[] = [];
      selected.forEach((r) => {
        if (!current.has(r)) toAdd.push(r);
      });
      current.forEach((r) => {
        if (!selected.has(r)) toRemove.push(r);
      });

      const failures: string[] = [];
      for (const r of toAdd) {
        try {
          await usersApi.assignRole(user.username, r);
        } catch (e: any) {
          failures.push(`Rol eklenemedi (${r}): ${e?.message || 'bilinmeyen hata'}`);
        }
      }
      for (const r of toRemove) {
        try {
          await usersApi.removeRole(user.username, r);
        } catch (e: any) {
          failures.push(`Rol kaldırılamadı (${r}): ${e?.message || 'bilinmeyen hata'}`);
        }
      }

      if (failures.length > 0) {
        alert(failures.join('\n'));
        // Hatalar varsa sayfada kal ve yeniden denemeye izin ver
        return;
      }

      // Başarılı ise önceki sayfaya dön
      router.back();
    } catch (err) {
      alert(
        'Kullanıcı güncellenirken hata oluştu: ' +
          (err instanceof Error ? err.message : 'Bilinmeyen hata'),
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="border-brand-200 border-t-brand mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4"></div>
            <p className="text-dark-600 font-medium">Yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="bg-light border-danger rounded-xl border-l-4 p-6 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="bg-danger-100 flex h-12 w-12 items-center justify-center rounded-full">
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
              <h2 className="text-danger-800 mb-2 text-lg font-semibold">Hata</h2>
              <p className="text-dark-700 mb-4">{error || 'Kullanıcı bulunamadı'}</p>
              <Button href="/users" variant="secondary" className="mt-4">
                Geri Dön
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // const availableRolesToAdd = AVAILABLE_ROLES.filter(role => !user.roles.includes(role));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kullanıcı Düzenle"
        description={`${user.firstName} ${user.lastName} - ${user.email}`}
        actions={
          <button
            onClick={async () => {
              if (!user) return;
              if (!confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) return;
              setIsProcessing(true);
              try {
                await usersApi.delete(user.id);
                router.push('/users');
              } catch (err) {
                alert('Kullanıcı silinirken hata oluştu');
              } finally {
                setIsProcessing(false);
              }
            }}
            className="text-light cursor-pointer rounded-md bg-red-500 px-4 py-2 font-medium transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isProcessing}
          >
            Sil
          </button>
        }
      />

      <div className="mx-auto max-w-3xl">
        <div className="bg-light border-dark-200 rounded-lg border p-4 shadow">
          <div className="space-y-5">
            {/* Temel Bilgiler */}
            <div>
              <h3 className="text-dark-800 mb-3 text-sm font-semibold">Temel Bilgiler</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-dark mb-1 block text-sm font-medium">Ad</label>
                  <input
                    className="border-dark-200 focus:ring-brand text-dark bg-light-50 w-full rounded-md border px-3 py-2 focus:border-transparent focus:ring-2 focus:outline-none"
                    value={editData.firstName || ''}
                    onChange={(e) => setEditData((d) => ({ ...d, firstName: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-dark mb-1 block text-sm font-medium">Soyad</label>
                  <input
                    className="border-dark-200 focus:ring-brand text-dark bg-light-50 w-full rounded-md border px-3 py-2 focus:border-transparent focus:ring-2 focus:outline-none"
                    value={editData.lastName || ''}
                    onChange={(e) => setEditData((d) => ({ ...d, lastName: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-dark mb-1 block text-sm font-medium">Email</label>
                  <input
                    disabled
                    className="border-dark-200 bg-dark-50 text-dark-500 w-full cursor-not-allowed rounded-md border px-3 py-2"
                    value={user.email}
                    readOnly
                  />
                </div>
                <div>
                  <label className="text-dark mb-1 block text-sm font-medium">Kullanıcı Adı</label>
                  <input
                    disabled
                    className="border-dark-200 bg-dark-50 text-dark-500 w-full cursor-not-allowed rounded-md border px-3 py-2"
                    value={user.username}
                    readOnly
                  />
                </div>
              </div>
            </div>

            {/* Ek Bilgiler */}
            <div className="border-dark-200 border-t pt-5">
              <h3 className="text-dark-800 mb-3 text-sm font-semibold">Ek Bilgiler</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-dark mb-1 block text-sm font-medium">LinkedIn</label>
                  <input
                    className="border-dark-200 focus:ring-brand text-dark bg-light-50 w-full rounded-md border px-3 py-2 focus:border-transparent focus:ring-2 focus:outline-none"
                    value={editData.linkedin || ''}
                    onChange={(e) => setEditData((d) => ({ ...d, linkedin: e.target.value }))}
                    placeholder="https://www.linkedin.com/in/..."
                  />
                </div>
                <div>
                  <label className="text-dark mb-1 block text-sm font-medium">Üniversite</label>
                  <input
                    className="border-dark-200 focus:ring-brand text-dark bg-light-50 w-full rounded-md border px-3 py-2 focus:border-transparent focus:ring-2 focus:outline-none"
                    value={editData.university || ''}
                    onChange={(e) => setEditData((d) => ({ ...d, university: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-dark mb-1 block text-sm font-medium">Fakülte</label>
                  <input
                    className="border-dark-200 focus:ring-brand text-dark bg-light-50 w-full rounded-md border px-3 py-2 focus:border-transparent focus:ring-2 focus:outline-none"
                    value={editData.faculty || ''}
                    onChange={(e) => setEditData((d) => ({ ...d, faculty: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-dark mb-1 block text-sm font-medium">Bölüm</label>
                  <input
                    className="border-dark-200 focus:ring-brand text-dark bg-light-50 w-full rounded-md border px-3 py-2 focus:border-transparent focus:ring-2 focus:outline-none"
                    value={editData.department || ''}
                    onChange={(e) => setEditData((d) => ({ ...d, department: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* Roller */}
            <div className="border-dark-200 border-t pt-5">
              <h3 className="text-dark-800 mb-3 text-sm font-semibold">Roller</h3>
              <div className="grid grid-cols-3 gap-2">
                {(availableRoles || []).map((role) => {
                  const isSelected = selectedRoles.includes(role);
                  return (
                    <label
                      key={role}
                      style={{
                        backgroundColor: isSelected ? '#e6f5f2' : undefined,
                        borderColor: isSelected ? '#27a68e' : undefined,
                      }}
                      className={`flex cursor-pointer items-center gap-2 rounded-md border p-2 transition-all ${
                        isSelected ? '' : 'bg-light border-dark-200'
                      }`}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = '#e6f5f2';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = '';
                        }
                      }}
                    >
                      <input
                        type="checkbox"
                        style={{ accentColor: '#27a68e' }}
                        className="h-4 w-4 rounded"
                        checked={isSelected}
                        onChange={(e) => {
                          setSelectedRoles((prev) =>
                            e.target.checked ? [...prev, role] : prev.filter((r) => r !== role),
                          );
                        }}
                      />
                      <span
                        style={{ color: isSelected ? '#27a68e' : undefined }}
                        className={`text-sm ${isSelected ? 'font-medium' : 'text-dark-700'}`}
                      >
                        {role}
                      </span>
                    </label>
                  );
                })}
              </div>
              <p className="text-dark-500 mt-3 text-xs">
                Değişiklikleri kaydetmek için Kaydet butonuna basın.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="border-dark-200 flex items-center justify-between gap-3 border-t pt-5">
              <Button
                href="/users"
                variant="secondary"
                className="border-red-500 bg-transparent text-red-500 hover:bg-red-500 hover:text-white"
              >
                İptal
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="!text-brand hover:!bg-brand border-brand !bg-transparent hover:!text-white"
              >
                {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
