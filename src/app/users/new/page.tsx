'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { Form } from '@/components/forms/Form';
import { TextField } from '@/components/forms/TextField';
import { Button } from '@/components/ui/Button';
import { z } from 'zod';
import { authApi } from '@/lib/api/auth';
import { usersApi } from '@/lib/api/users';
// Roller dinamik olarak /api/roles üzerinden yüklenecek

const registerSchema = z.object({
  username: z.string().min(3, 'En az 3 karakter olmalı'),
  email: z.string().email('Geçerli bir email girin'),
  firstName: z.string().min(2, 'En az 2 karakter olmalı'),
  lastName: z.string().min(2, 'En az 2 karakter olmalı'),
  password: z.string().min(6, 'En az 6 karakter olmalı'),
  // Ek profil alanları (opsiyonel)
  linkedin: z.string().url('Geçerli bir URL girin').optional().or(z.literal('')),
  university: z.string().optional(),
  faculty: z.string().optional(),
  department: z.string().optional(),
});

export default function NewUserPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);

  // Rolleri sunucudan al
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

  const handleSubmit = async (data: z.infer<typeof registerSchema>) => {
    startTransition(async () => {
      try {
        const { username, email, firstName, lastName, password, linkedin, university, faculty, department } = data;
        // 1) Kayıt: Backend create şeması sadece temel alanları kabul ediyor
        await authApi.register({ username, email, firstName, lastName, password });

        // 2) Ek alanlar varsa, kullanıcıyı bulup güncelle
        if (linkedin || university || faculty || department || selectedRoles.length > 0) {
          try {
            const list = await usersApi.getAll();
            if (list?.data?.length) {
              const created = list.data.find((u: any) => u.username === username || u.email === email);
              if (created?.id) {
                await usersApi.update(created.id, {
                  linkedin: linkedin || undefined,
                  university: university || undefined,
                  faculty: faculty || undefined,
                  department: department || undefined,
                });
                // Rolleri ata (tek tek dene, hata varsa biriktir)
                const failures: string[] = [];
                for (const role of selectedRoles) {
                  try {
                    await usersApi.addRole(created.username, role);
                  } catch (e: any) {
                    failures.push(`Rol eklenemedi (${role}): ${e?.message || 'bilinmeyen hata'}`);
                  }
                }
                if (failures.length > 0) {
                  alert(failures.join('\n'));
                }
              }
            }
          } catch (e) {
            // Sessizce geç: ek alanlar opsiyonel
            console.error('Ek alan güncelleme hata:', e);
          }
        }

        router.push('/users');
      } catch (error) {
        console.error(error);
      }
    });
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="Yeni Kullanıcı"
          description="Sisteme yeni kullanıcı ekleyin"
        />

        <div className="max-w-3xl mx-auto">
        <div className="bg-light p-4 rounded-lg shadow border border-dark-200">
        <Form
          schema={registerSchema}
          onSubmit={handleSubmit}
          defaultValues={{
            university: 'Yıldız Teknik Üniversitesi',
          }}
        >
          {(methods) => (
            <>
                <div className="space-y-5">
                  {/* Temel Bilgiler */}
                  <div>
                    <h3 className="text-sm font-semibold text-dark-800 mb-3">Temel Bilgiler</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <TextField name="firstName" label="Ad" required placeholder="Ahmet" />
                      <TextField name="lastName" label="Soyad" required placeholder="Yılmaz" />
                <TextField name="username" label="Kullanıcı Adı" required placeholder="johndoe" />
                <TextField name="email" label="Email" type="email" required placeholder="ornek@email.com" />
                <TextField name="password" label="Şifre" type="password" required placeholder="••••••" />
                    </div>
                  </div>

                  {/* Ek Bilgiler */}
                  <div className="border-t border-dark-200 pt-5">
                    <h3 className="text-sm font-semibold text-dark-800 mb-3">Ek Bilgiler (Opsiyonel)</h3>
                    <div className="grid grid-cols-2 gap-4">
                <TextField name="linkedin" label="LinkedIn" placeholder="https://www.linkedin.com/in/..." />
                <TextField name="university" label="Üniversite" placeholder="Yıldız Teknik Üniversitesi" />
                <TextField name="faculty" label="Fakülte" placeholder="Bilgisayar ve Bilişim Fakültesi" />
                <TextField name="department" label="Bölüm" placeholder="Bilgisayar Mühendisliği" />
                    </div>
                  </div>

                  {/* Roller */}
                  <div className="border-t border-dark-200 pt-5">
                    <h3 className="text-sm font-semibold text-dark-800 mb-3">Roller</h3>
                    <div className="grid grid-cols-3 gap-2">
                    {(availableRoles || []).map((role) => (
                        <label
                          key={role}
                          style={{
                            backgroundColor: selectedRoles.includes(role) ? '#e6f5f2' : undefined,
                            borderColor: selectedRoles.includes(role) ? '#27a68e' : undefined,
                          }}
                          className={`flex items-center gap-2 p-2 rounded-md border cursor-pointer transition-all ${
                            selectedRoles.includes(role)
                              ? ''
                              : 'bg-light border-dark-200'
                          }`}
                          onMouseEnter={(e) => {
                            if (!selectedRoles.includes(role)) {
                              e.currentTarget.style.backgroundColor = '#e6f5f2';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!selectedRoles.includes(role)) {
                              e.currentTarget.style.backgroundColor = '';
                            }
                          }}
                        >
                        <input
                          type="checkbox"
                            style={{ accentColor: '#27a68e' }}
                            className="h-4 w-4 rounded"
                          checked={selectedRoles.includes(role)}
                          onChange={(e) => {
                            setSelectedRoles((prev) =>
                              e.target.checked ? [...prev, role] : prev.filter((r) => r !== role)
                            );
                          }}
                        />
                          <span 
                            style={{ color: selectedRoles.includes(role) ? '#27a68e' : undefined }}
                            className={`text-sm ${selectedRoles.includes(role) ? 'font-medium' : 'text-dark-700'}`}
                          >
                            {role}
                          </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
                <div className="flex justify-between items-center gap-3 mt-6 pt-5 border-t border-dark-200">
                  <Button href="/users" variant="secondary" className="text-red-500 hover:bg-red-500 hover:text-white bg-transparent border-red-500">
                    İptal
                  </Button>
                  <Button type="submit" disabled={isPending} className="!text-brand hover:!bg-brand hover:!text-white !bg-transparent border-brand">
                  {isPending ? 'Kaydediliyor...' : 'Kaydet'}
                </Button>
              </div>
            </>
          )}
        </Form>
        </div>
        </div>
      </div>
    </AppShell>
  );
}


