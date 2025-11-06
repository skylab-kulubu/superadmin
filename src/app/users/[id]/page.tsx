'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
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
          <div className="text-center py-8">Yükleniyor...</div>
        </div>
      </AppShell>
    );
  }

  if (error || !user) {
    return (
      <AppShell>
        <div className="max-w-4xl mx-auto">
          <div className="bg-pembe-50 border border-pembe-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-pembe-700 mb-2">Hata</h2>
            <p className="text-pembe-700">{error || 'Kullanıcı bulunamadı'}</p>
            <Button href="/users" variant="secondary" className="mt-4">
              Geri Dön
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  // const availableRolesToAdd = AVAILABLE_ROLES.filter(role => !user.roles.includes(role));

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-yesil">Kullanıcı Detayı</h1>
          <div className="flex items-center gap-2">
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
              className="px-4 py-2 rounded-md font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed bg-pembe-500 text-lacivert hover:bg-pembe-600"
              disabled={isProcessing}
            >
              Sil
            </button>
            <Button href="/users" variant="secondary">
              Geri Dön
            </Button>
          </div>
        </div>
        
        <div className="bg-lacivert p-6 rounded-lg shadow border border-pembe-200">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-pembe mb-1">Ad</label>
              <input
                className="w-full px-3 py-2 border border-pembe-200 rounded-md focus:outline-none focus:ring-2 focus:ring-lacivert focus:border-transparent text-lacivert bg-pembe-50"
                value={editData.firstName || ''}
                onChange={(e) => setEditData((d) => ({ ...d, firstName: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-pembe mb-1">Soyad</label>
              <input
                className="w-full px-3 py-2 border border-pembe-200 rounded-md focus:outline-none focus:ring-2 focus:ring-lacivert focus:border-transparent text-lacivert bg-pembe-50"
                value={editData.lastName || ''}
                onChange={(e) => setEditData((d) => ({ ...d, lastName: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-pembe mb-1">Email</label>
              <input
                disabled
                className="w-full px-3 py-2 border border-pembe-200 bg-pembe-50 rounded-md text-lacivert"
                value={user.email}
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-pembe mb-1">Kullanıcı Adı</label>
              <input
                disabled
                className="w-full px-3 py-2 border border-pembe-200 bg-pembe-50 rounded-md text-lacivert"
                value={user.username}
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-pembe mb-1">LinkedIn</label>
              <input
                className="w-full px-3 py-2 border border-pembe-200 rounded-md focus:outline-none focus:ring-2 focus:ring-lacivert focus:border-transparent text-lacivert bg-pembe-50"
                value={editData.linkedin || ''}
                onChange={(e) => setEditData((d) => ({ ...d, linkedin: e.target.value }))}
                placeholder="https://www.linkedin.com/in/..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-pembe mb-1">Üniversite</label>
              <input
                className="w-full px-3 py-2 border border-pembe-200 rounded-md focus:outline-none focus:ring-2 focus:ring-lacivert focus:border-transparent text-lacivert bg-pembe-50"
                value={editData.university || ''}
                onChange={(e) => setEditData((d) => ({ ...d, university: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-pembe mb-1">Fakülte</label>
              <input
                className="w-full px-3 py-2 border border-pembe-200 rounded-md focus:outline-none focus:ring-2 focus:ring-lacivert focus:border-transparent text-lacivert bg-pembe-50"
                value={editData.faculty || ''}
                onChange={(e) => setEditData((d) => ({ ...d, faculty: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-pembe mb-1">Bölüm</label>
              <input
                className="w-full px-3 py-2 border border-pembe-200 rounded-md focus:outline-none focus:ring-2 focus:ring-lacivert focus:border-transparent text-lacivert bg-pembe-50"
                value={editData.department || ''}
                onChange={(e) => setEditData((d) => ({ ...d, department: e.target.value }))}
              />
            </div>
          </div>

          <div className="border-t pt-6">
            <div className="mb-2">
              <label className="text-sm font-medium text-pembe">Roller</label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(availableRoles || []).map((role) => (
                <label key={role} className="flex items-center gap-2 text-pembe">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={selectedRoles.includes(role)}
                    onChange={(e) => {
                      setSelectedRoles((prev) =>
                        e.target.checked ? [...prev, role] : prev.filter((r) => r !== role)
                      );
                    }}
                  />
                  <span>{role}</span>
                </label>
              ))}
            </div>
            <p className="mt-2 text-sm text-pembe opacity-70">Değişiklikleri kaydetmek için Kaydet'e basın.</p>
          </div>

          <div className="flex justify-end mt-6">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
          </div>
        </div>
      </div>

      {/* Rol modalı kaldırıldı */}
    </AppShell>
  );
}
