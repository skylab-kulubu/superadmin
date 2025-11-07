'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { Form } from '@/components/forms/Form';
import { TextField } from '@/components/forms/TextField';
import { DatePicker } from '@/components/forms/DatePicker';
import { Button } from '@/components/ui/Button';
import { Toggle } from '@/components/ui/Toggle';
import { z } from 'zod';
import { seasonsApi } from '@/lib/api/seasons';
import type { SeasonDto } from '@/types/api';
import { formatGMT0ToLocalInput, convertGMT3ToGMT0 } from '@/lib/utils/date';

const seasonSchema = z.object({
  name: z.string().min(2, 'En az 2 karakter olmalı'),
  startDate: z.string(),
  endDate: z.string(),
  active: z.boolean().optional(),
});

export default function EditSeasonPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [isPending, startTransition] = useTransition();
  const [season, setSeason] = useState<SeasonDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (id) {
      seasonsApi.getById(id).then((response) => {
        if (response.success && response.data) {
          setSeason(response.data);
          setIsActive(response.data.active ?? true);
        } else {
          setError('Sezon bulunamadı');
        }
        setLoading(false);
      }).catch((err) => {
        console.error('Season fetch error:', err);
        setError('Sezon yüklenirken hata oluştu');
        setLoading(false);
      });
    }
  }, [id]);

  const handleSubmit = async (data: z.infer<typeof seasonSchema>) => {
    startTransition(async () => {
      try {
        await seasonsApi.update(id, {
          name: data.name,
          startDate: convertGMT3ToGMT0(data.startDate),
          endDate: convertGMT3ToGMT0(data.endDate),
          active: isActive,
        });
        router.push('/seasons');
      } catch (error) {
        console.error('Season update error:', error);
        alert('Sezon güncellenirken hata oluştu: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
      }
    });
  };

  if (loading) {
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto">
          <div className="text-center py-8">Yükleniyor...</div>
        </div>
      </AppShell>
    );
  }

  if (error || !season) {
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Hata</h2>
            <p className="text-red-700">{error || 'Sezon bulunamadı'}</p>
            <Button href="/seasons" variant="secondary" className="mt-4">
              Geri Dön
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }


  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="Sezon Düzenle"
          description={season.name}
          actions={<Toggle checked={isActive} onChange={setIsActive} />}
        />

        <div className="max-w-3xl mx-auto">
        <div className="bg-light p-4 rounded-lg shadow border border-dark-200">
        <Form 
          schema={seasonSchema} 
          onSubmit={handleSubmit} 
          defaultValues={{ 
            name: season.name,
            startDate: formatGMT0ToLocalInput(season.startDate),
            endDate: formatGMT0ToLocalInput(season.endDate),
          }}
        >
          {(methods) => {
            const formErrors = methods.formState.errors;
            return (
              <>
                {Object.keys(formErrors).length > 0 && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm font-medium text-red-800 mb-2">Form hataları:</p>
                    <ul className="list-disc list-inside text-sm text-red-600">
                      {Object.entries(formErrors).map(([key, error]) => (
                        <li key={key}>
                          {key}: {error?.message as string}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-sm font-semibold text-dark-800 mb-3">Temel Bilgiler</h3>
                      <div className="grid grid-cols-2 gap-4">
                  <TextField name="name" label="Ad" required placeholder="2024-2025" />
                  <DatePicker name="startDate" label="Başlangıç Tarihi" required />
                  <DatePicker name="endDate" label="Bitiş Tarihi" required />
                      </div>
                    </div>
                </div>
                  <div className="flex justify-between items-center gap-3 mt-6 pt-5 border-t border-dark-200">
                    <Button href="/seasons" variant="secondary" className="text-red-500 hover:bg-red-500 hover:text-white bg-transparent border-red-500">
                      İptal
                    </Button>
                    <Button type="submit" disabled={isPending} className="!text-brand hover:!bg-brand hover:!text-white !bg-transparent border-brand">
                    {isPending ? 'Güncelleniyor...' : 'Güncelle'}
                  </Button>
                </div>
              </>
            );
          }}
        </Form>
        </div>
        </div>
      </div>
    </AppShell>
  );
}

