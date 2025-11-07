'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
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
      selected.forEach((r) => { if (!current.has(r)) toAdd.push(r); });
      current.forEach((r) => { if (!selected.has(r)) toRemove.push(r); });

      const failures: string[] = [];
      for (const r of toAdd) {
        try {
          await usersApi.addRole(user.username, r);
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
      alert('Kullanıcı güncellenirken hata oluştu: ' + (err instanceof Error ? err.message : 'Bilinmeyen hata'));
    } finally {
      setIsSaving(false);
    }
  };

  
  if (loading) {
    return (
      <AppShell>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-brand-200 border-t-brand rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-dark-600 font-medium">Yükleniyor...</p>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  if (error || !user) {
    return (
      <AppShell>
        <div className="max-w-4xl mx-auto">
          <div className="bg-light border-l-4 border-danger rounded-xl shadow-lg p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-danger-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-danger-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-danger-800 mb-2">Hata</h2>
                <p className="text-dark-700 mb-4">{error || 'Kullanıcı bulunamadı'}</p>
            <Button href="/users" variant="secondary" className="mt-4">
              Geri Dön
            </Button>
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  // const availableRolesToAdd = AVAILABLE_ROLES.filter(role => !user.roles.includes(role));

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="Kullanıcı Düzenle"
          description={`${user.firstName} ${user.lastName} - ${user.email}`}
          actions={(
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
              className="px-4 py-2 rounded-md font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed bg-red-500 text-light hover:bg-red-600"
              disabled={isProcessing}
            >
              Sil
            </button>
          )}
        />
        
        <div className="max-w-3xl mx-auto">
        <div className="bg-light p-4 rounded-lg shadow border border-dark-200">
          <div className="space-y-5">
            {/* Temel Bilgiler */}
            <div>
              <h3 className="text-sm font-semibold text-dark-800 mb-3">Temel Bilgiler</h3>
              <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark mb-1">Ad</label>
              <input
                className="w-full px-3 py-2 border border-dark-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent text-dark bg-light-50"
                value={editData.firstName || ''}
                onChange={(e) => setEditData((d) => ({ ...d, firstName: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1">Soyad</label>
              <input
                className="w-full px-3 py-2 border border-dark-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent text-dark bg-light-50"
                value={editData.lastName || ''}
                onChange={(e) => setEditData((d) => ({ ...d, lastName: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1">Email</label>
              <input
                disabled
                    className="w-full px-3 py-2 border border-dark-200 bg-dark-50 rounded-md text-dark-500 cursor-not-allowed"
                value={user.email}
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1">Kullanıcı Adı</label>
              <input
                disabled
                    className="w-full px-3 py-2 border border-dark-200 bg-dark-50 rounded-md text-dark-500 cursor-not-allowed"
                value={user.username}
                readOnly
              />
            </div>
              </div>
            </div>

            {/* Ek Bilgiler */}
            <div className="border-t border-dark-200 pt-5">
              <h3 className="text-sm font-semibold text-dark-800 mb-3">Ek Bilgiler</h3>
              <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark mb-1">LinkedIn</label>
              <input
                className="w-full px-3 py-2 border border-dark-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent text-dark bg-light-50"
                value={editData.linkedin || ''}
                onChange={(e) => setEditData((d) => ({ ...d, linkedin: e.target.value }))}
                placeholder="https://www.linkedin.com/in/..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1">Üniversite</label>
              <input
                className="w-full px-3 py-2 border border-dark-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent text-dark bg-light-50"
                value={editData.university || ''}
                onChange={(e) => setEditData((d) => ({ ...d, university: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1">Fakülte</label>
              <input
                className="w-full px-3 py-2 border border-dark-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent text-dark bg-light-50"
                value={editData.faculty || ''}
                onChange={(e) => setEditData((d) => ({ ...d, faculty: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1">Bölüm</label>
              <input
                className="w-full px-3 py-2 border border-dark-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent text-dark bg-light-50"
                value={editData.department || ''}
                onChange={(e) => setEditData((d) => ({ ...d, department: e.target.value }))}
              />
            </div>
          </div>
            </div>

            {/* Roller */}
            <div className="border-t border-dark-200 pt-5">
              <h3 className="text-sm font-semibold text-dark-800 mb-3">Roller</h3>
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
                      className={`flex items-center gap-2 p-2 rounded-md border cursor-pointer transition-all ${
                        isSelected
                          ? ''
                          : 'bg-light border-dark-200'
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
                        e.target.checked ? [...prev, role] : prev.filter((r) => r !== role)
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
              <p className="mt-3 text-xs text-dark-500">Değişiklikleri kaydetmek için Kaydet butonuna basın.</p>
          </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center gap-3 pt-5 border-t border-dark-200">
              <Button href="/users" variant="secondary" className="text-red-500 hover:bg-red-500 hover:text-white bg-transparent border-red-500">
                İptal
              </Button>
              <Button onClick={handleSave} disabled={isSaving} className="!text-brand hover:!bg-brand hover:!text-white !bg-transparent border-brand">
              {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
            </div>
          </div>
        </div>
        </div>
      </div>
    </AppShell>
  );
}
