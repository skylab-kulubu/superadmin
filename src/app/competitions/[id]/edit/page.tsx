'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { Form } from '@/components/forms/Form';
import { TextField } from '@/components/forms/TextField';
import { DatePicker } from '@/components/forms/DatePicker';
import { Select } from '@/components/forms/Select';
import { Button } from '@/components/ui/Button';
import { Toggle } from '@/components/ui/Toggle';
import { z } from 'zod';
import { competitionsApi } from '@/lib/api/competitions';
import { eventTypesApi } from '@/lib/api/event-types';
import type { CompetitionDto } from '@/types/api';
import { formatGMT0ToLocalInput, convertGMT3ToGMT0 } from '@/lib/utils/date';

const competitionSchema = z.object({
  name: z.string().min(2, 'En az 2 karakter olmalı'),
  startDate: z.string(),
  endDate: z.string(),
  active: z.boolean().optional(),
  eventTypeId: z.string().optional(),
});

export default function EditCompetitionPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [isPending, startTransition] = useTransition();
  const [competition, setCompetition] = useState<CompetitionDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eventTypes, setEventTypes] = useState<{ value: string; label: string }[]>([]);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (id) {
      Promise.all([
        competitionsApi.getById(id),
        eventTypesApi.getAll(),
      ]).then(([competitionResponse, eventTypesResponse]) => {
        if (competitionResponse.success && competitionResponse.data) {
          setCompetition(competitionResponse.data);
          setIsActive(competitionResponse.data.active ?? true);
        } else {
          setError('Yarışma bulunamadı');
        }
        if (eventTypesResponse.success && eventTypesResponse.data) {
          setEventTypes(eventTypesResponse.data.map((et) => ({ value: et.id, label: et.name })));
        }
        setLoading(false);
      }).catch((err) => {
        console.error('Competition fetch error:', err);
        setError('Yarışma yüklenirken hata oluştu');
        setLoading(false);
      });
    }
  }, [id]);

  const handleSubmit = async (data: z.infer<typeof competitionSchema>) => {
    startTransition(async () => {
      try {
        await competitionsApi.update(id, {
          name: data.name,
          startDate: convertGMT3ToGMT0(data.startDate),
          endDate: convertGMT3ToGMT0(data.endDate),
          active: isActive,
          eventTypeId: data.eventTypeId || undefined,
        });
        router.push('/competitions');
      } catch (error) {
        console.error('Competition update error:', error);
        alert('Yarışma güncellenirken hata oluştu: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
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

  if (error || !competition) {
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Hata</h2>
            <p className="text-red-700">{error || 'Yarışma bulunamadı'}</p>
            <Button href="/competitions" variant="secondary" className="mt-4">
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
          title="Yarışma Düzenle"
          description={competition.name}
          actions={<Toggle checked={isActive} onChange={setIsActive} />}
        />

        <div className="max-w-3xl mx-auto">
        <div className="bg-light p-4 rounded-lg shadow border border-dark-200">
        <Form 
          schema={competitionSchema} 
          onSubmit={handleSubmit} 
          defaultValues={{ 
            name: competition.name,
            startDate: formatGMT0ToLocalInput(competition.startDate),
            endDate: formatGMT0ToLocalInput(competition.endDate),
            eventTypeId: competition.eventType?.id || '',
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
                  <TextField name="name" label="Ad" required placeholder="Hackathon 2024" />
                  {eventTypes.length > 0 && (
                    <Select name="eventTypeId" label="Etkinlik Tipi" options={eventTypes} />
                  )}
                        <DatePicker name="startDate" label="Başlangıç Tarihi" required />
                        <DatePicker name="endDate" label="Bitiş Tarihi" required />
                      </div>
                    </div>
                </div>
                  <div className="flex justify-between items-center gap-3 mt-6 pt-5 border-t border-dark-200">
                    <Button href="/competitions" variant="secondary" className="text-red-500 hover:bg-red-500 hover:text-white bg-transparent border-red-500">
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

