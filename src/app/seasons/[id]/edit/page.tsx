'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

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
      seasonsApi
        .getById(id)
        .then((response) => {
          if (response.success && response.data) {
            setSeason(response.data);
            setIsActive(response.data.active ?? true);
          } else {
            setError('Sezon bulunamadı');
          }
          setLoading(false);
        })
        .catch((err) => {
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
        alert(
          'Sezon güncellenirken hata oluştu: ' +
            (error instanceof Error ? error.message : 'Bilinmeyen hata'),
        );
      }
    });
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="py-8 text-center">Yükleniyor...</div>
      </div>
    );
  }

  if (error || !season) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <h2 className="mb-2 text-lg font-semibold text-red-800">Hata</h2>
          <p className="text-red-700">{error || 'Sezon bulunamadı'}</p>
          <Button href="/seasons" variant="secondary" className="mt-4">
            Geri Dön
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sezon Düzenle"
        description={season.name}
        actions={<Toggle checked={isActive} onChange={setIsActive} />}
      />

      <div className="mx-auto max-w-3xl">
        <div className="bg-light border-dark-200 rounded-lg border p-4 shadow">
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
                    <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-4">
                      <p className="mb-2 text-sm font-medium text-red-800">Form hataları:</p>
                      <ul className="list-inside list-disc text-sm text-red-600">
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
                      <h3 className="text-dark-800 mb-3 text-sm font-semibold">Temel Bilgiler</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <TextField name="name" label="Ad" required placeholder="2024-2025" />
                        <DatePicker name="startDate" label="Başlangıç Tarihi" required />
                        <DatePicker name="endDate" label="Bitiş Tarihi" required />
                      </div>
                    </div>
                  </div>
                  <div className="border-dark-200 mt-6 flex items-center justify-between gap-3 border-t pt-5">
                    <Button
                      href="/seasons"
                      variant="secondary"
                      className="border-red-500 bg-transparent text-red-500 hover:bg-red-500 hover:text-white"
                    >
                      İptal
                    </Button>
                    <Button
                      type="submit"
                      disabled={isPending}
                      className="!text-brand hover:!bg-brand border-brand !bg-transparent hover:!text-white"
                    >
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
  );
}
