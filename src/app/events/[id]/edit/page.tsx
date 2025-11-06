'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Form } from '@/components/forms/Form';
import { TextField } from '@/components/forms/TextField';
import { Textarea } from '@/components/forms/Textarea';
import { DatePicker } from '@/components/forms/DatePicker';
import { Select } from '@/components/forms/Select';
import { FileUpload } from '@/components/forms/FileUpload';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/forms/Checkbox';
import { z } from 'zod';
import { eventsApi } from '@/lib/api/events';
import { eventTypesApi } from '@/lib/api/event-types';
import type { EventDto } from '@/types/api';

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

  useEffect(() => {
    if (id) {
      Promise.all([
        eventsApi.getById(id, { includeEventType: true }),
        eventTypesApi.getAll(),
      ]).then(([eventResponse, eventTypesResponse]) => {
        if (eventResponse.success && eventResponse.data) {
          setEvent(eventResponse.data);
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
          startDate: new Date(data.startDate).toISOString(),
          endDate: data.endDate ? new Date(data.endDate).toISOString() : undefined,
          linkedin: data.linkedin || undefined,
          active: data.active || undefined,
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

  // Tarih formatını düzenle (datetime-local için YYYY-MM-DDTHH:mm)
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Etkinlik Düzenle</h1>
        <Form 
          schema={eventSchema} 
          onSubmit={handleSubmit} 
          defaultValues={{ 
            name: event.name,
            description: event.description || '',
            location: event.location || '',
            eventTypeId: event.type?.id || '',
            formUrl: event.formUrl || '',
            startDate: formatDateForInput(event.startDate),
            endDate: event.endDate ? formatDateForInput(event.endDate) : '',
            linkedin: event.linkedin || '',
            active: event.active,
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
                <div className="space-y-4">
                  <TextField name="name" label="Ad" required placeholder="Yazılım Geliştirme Workshop'u" />
                  <Textarea name="description" label="Açıklama" rows={4} placeholder="Etkinlik hakkında detaylı bilgi..." />
                  <TextField name="location" label="Konum" placeholder="YTÜ Davutpaşa Kampüsü" />
                  <Select 
                    name="eventTypeId" 
                    label="Etkinlik Tipi" 
                    options={eventTypes}
                    required 
                  />
                  <TextField name="formUrl" label="Form URL" type="url" placeholder="https://forms.google.com/..." />
                  <DatePicker name="startDate" label="Başlangıç Tarihi" required />
                  <DatePicker name="endDate" label="Bitiş Tarihi" />
                  <TextField name="linkedin" label="LinkedIn URL" type="url" placeholder="https://www.linkedin.com/events/..." />
                  {event.coverImageUrl && (
                    <div>
                      <label className="block text-sm font-medium text-pembe mb-1">Mevcut Kapak</label>
                      <img src={event.coverImageUrl} alt="Mevcut Kapak" className="h-24 w-40 object-cover rounded border" />
                    </div>
                  )}
                  <FileUpload name="coverImage" label="Kapak Resmi" accept="image/*" />
                  <Checkbox name="active" label="Aktif" />
                </div>
                <div className="mt-6 flex gap-4">
                  <Button type="submit" disabled={isPending}>
                    {isPending ? 'Güncelleniyor...' : 'Güncelle'}
                  </Button>
                  <Button href="/events" variant="secondary">
                    İptal
                  </Button>
                </div>
              </>
            );
          }}
        </Form>
      </div>
    </AppShell>
  );
}

