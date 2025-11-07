'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { Form } from '@/components/forms/Form';
import { TextField } from '@/components/forms/TextField';
import { Textarea } from '@/components/forms/Textarea';
import { DatePicker } from '@/components/forms/DatePicker';
import { Select } from '@/components/forms/Select';
import { FileUpload } from '@/components/forms/FileUpload';
import { Button } from '@/components/ui/Button';
import { Toggle } from '@/components/ui/Toggle';
import { z } from 'zod';
import { eventsApi } from '@/lib/api/events';
import { eventTypesApi } from '@/lib/api/event-types';
import type { EventDto } from '@/types/api';
import { formatGMT0ToLocalInput, convertGMT3ToGMT0 } from '@/lib/utils/date';

const eventSchema = z.object({
  name: z.string().min(2, 'En az 2 karakter olmalı'),
  description: z.string().optional(),
  location: z.string().optional(),
  eventTypeId: z.string().min(1, 'Etkinlik tipi seçiniz'),
  formUrl: z.string().url().optional().or(z.literal('')),
  startDate: z.string(),
  endDate: z.string().optional(),
  linkedin: z.string().url().optional().or(z.literal('')),
  active: z.boolean().optional(),
  competitionId: z.string().optional(),
  coverImage: z.custom<File | undefined>((val) => val === undefined || val instanceof File).optional(),
});

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [isPending, startTransition] = useTransition();
  const [event, setEvent] = useState<EventDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eventTypes, setEventTypes] = useState<{ value: string; label: string }[]>([]);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (id) {
      Promise.all([
        eventsApi.getById(id, { includeEventType: true }),
        eventTypesApi.getAll(),
      ]).then(([eventResponse, eventTypesResponse]) => {
        if (eventResponse.success && eventResponse.data) {
          setEvent(eventResponse.data);
          setIsActive(eventResponse.data.active ?? true);
        } else {
          setError('Etkinlik bulunamadı');
        }
        if (eventTypesResponse.success && eventTypesResponse.data) {
          setEventTypes(eventTypesResponse.data.map((et) => ({ value: et.id, label: et.name })));
        }
        setLoading(false);
      }).catch((err) => {
        console.error('Event fetch error:', err);
        setError('Etkinlik yüklenirken hata oluştu');
        setLoading(false);
      });
    }
  }, [id]);

  const handleSubmit = async (data: z.infer<typeof eventSchema>) => {
    startTransition(async () => {
      try {
        const coverImage = data.coverImage;
        const eventData = {
          name: data.name,
          description: data.description || undefined,
          location: data.location || undefined,
          eventTypeId: data.eventTypeId,
          formUrl: data.formUrl || undefined,
          startDate: convertGMT3ToGMT0(data.startDate),
          endDate: data.endDate ? convertGMT3ToGMT0(data.endDate) : undefined,
          linkedin: data.linkedin || undefined,
          active: isActive,
          competitionId: data.competitionId || undefined,
        };

        if (coverImage) {
          await eventsApi.update(id, coverImage, eventData);
        } else {
          await eventsApi.update(id, undefined, eventData);
        }
        
        router.push('/events');
      } catch (error) {
        console.error('Event update error:', error);
        alert('Etkinlik güncellenirken hata oluştu: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
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

  if (error || !event) {
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Hata</h2>
            <p className="text-red-700">{error || 'Etkinlik bulunamadı'}</p>
            <Button href="/events" variant="secondary" className="mt-4">
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
          title="Etkinlik Düzenle"
          description={event.name}
          actions={<Toggle checked={isActive} onChange={setIsActive} />}
        />

        <div className="max-w-3xl mx-auto">
        <div className="bg-light p-4 rounded-lg shadow border border-dark-200">
        <Form 
          schema={eventSchema} 
          onSubmit={handleSubmit} 
          defaultValues={{ 
            name: event.name,
            description: event.description || '',
            location: event.location || '',
            eventTypeId: event.type?.id || '',
            formUrl: event.formUrl || '',
            startDate: formatGMT0ToLocalInput(event.startDate),
            endDate: event.endDate ? formatGMT0ToLocalInput(event.endDate) : '',
            linkedin: event.linkedin || '',
            competitionId: event.competition?.id || '',
            coverImage: undefined,
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
                  <TextField name="name" label="Ad" required placeholder="Yazılım Geliştirme Workshop'u" />
                  <Select 
                    name="eventTypeId" 
                    label="Etkinlik Tipi" 
                    options={eventTypes}
                    required 
                  />
                        <TextField name="location" label="Konum" placeholder="YTÜ Davutpaşa Kampüsü" />
                  <TextField name="formUrl" label="Form URL" type="url" placeholder="https://forms.google.com/..." />
                      </div>
                      <div className="mt-4">
                        <Textarea name="description" label="Açıklama" rows={4} placeholder="Etkinlik hakkında detaylı bilgi..." />
                      </div>
                    </div>

                    <div className="border-t border-dark-200 pt-5">
                      <h3 className="text-sm font-semibold text-dark-800 mb-3">Tarih ve Zaman</h3>
                      <div className="grid grid-cols-2 gap-4">
                  <DatePicker name="startDate" label="Başlangıç Tarihi" required />
                  <DatePicker name="endDate" label="Bitiş Tarihi" />
                      </div>
                    </div>

                    <div className="border-t border-dark-200 pt-5">
                      <h3 className="text-sm font-semibold text-dark-800 mb-3">Ek Bilgiler</h3>
                      <div className="space-y-4">
                  <TextField name="linkedin" label="LinkedIn URL" type="url" placeholder="https://www.linkedin.com/events/..." />
                  {event.coverImageUrl && (
                    <div>
                      <label className="block text-sm font-medium text-dark mb-1">Mevcut Kapak</label>
                      <img src={event.coverImageUrl} alt="Mevcut Kapak" className="h-24 w-40 object-cover rounded border" />
                    </div>
                  )}
                  <FileUpload name="coverImage" label="Kapak Resmi" accept="image/*" />
                      </div>
                    </div>
                </div>
                  <div className="flex justify-between items-center gap-3 mt-6 pt-5 border-t border-dark-200">
                    <Button href="/events" variant="secondary" className="text-red-500 hover:bg-red-500 hover:text-white bg-transparent border-red-500">
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

