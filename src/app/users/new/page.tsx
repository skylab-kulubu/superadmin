'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
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
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-yesil">Yeni Kullanıcı</h1>
        <Form schema={registerSchema} onSubmit={handleSubmit}>
          {(methods) => (
            <>
              <div className="space-y-4">
                <TextField name="username" label="Kullanıcı Adı" required placeholder="johndoe" />
                <TextField name="email" label="Email" type="email" required placeholder="ornek@email.com" />
                <TextField name="firstName" label="Ad" required placeholder="Ahmet" />
                <TextField name="lastName" label="Soyad" required placeholder="Yılmaz" />
                <TextField name="password" label="Şifre" type="password" required placeholder="••••••" />
                <TextField name="linkedin" label="LinkedIn" placeholder="https://www.linkedin.com/in/..." />
                <TextField name="university" label="Üniversite" placeholder="Yıldız Teknik Üniversitesi" />
                <TextField name="faculty" label="Fakülte" placeholder="Bilgisayar ve Bilişim Fakültesi" />
                <TextField name="department" label="Bölüm" placeholder="Bilgisayar Mühendisliği" />
                <div>
                  <label className="block text-sm font-medium text-pembe mb-2">Roller</label>
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
                </div>
              </div>
              <div className="mt-6 flex gap-4">
                <Button type="submit" disabled={isPending}>
                  {isPending ? 'Kaydediliyor...' : 'Kaydet'}
                </Button>
                <Button href="/users" variant="secondary">
                  İptal
                </Button>
              </div>
            </>
          )}
        </Form>
      </div>
    </AppShell>
  );
}


