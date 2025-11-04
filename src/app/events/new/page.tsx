'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Form } from '@/components/forms/Form';
import { TextField } from '@/components/forms/TextField';
import { DatePicker } from '@/components/forms/DatePicker';
import { Select } from '@/components/forms/Select';
import { FileUpload } from '@/components/forms/FileUpload';
import { Button } from '@/components/ui/Button';
import { z } from 'zod';
import { eventsApi } from '@/lib/api/events';
import { eventTypesApi } from '@/lib/api/event-types';

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
  coverImage: z.instanceof(File).optional(),
});

export default function NewEventPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [eventTypes, setEventTypes] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    eventTypesApi.getAll().then((response) => {
      if (response.success && response.data) {
        setEventTypes(response.data.map((et) => ({ value: et.id, label: et.name })));
      }
    }).catch((error) => {
      console.error('Event types fetch error:', error);
    });
  }, []);

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
          await eventsApi.create(coverImage, eventData);
        } else {
          // Cover image yoksa sadece data gönder
          await eventsApi.create(new File([], ''), eventData);
        }
        
        router.push('/events');
      } catch (error) {
        console.error('Event creation error:', error);
        alert('Etkinlik oluşturulurken hata oluştu: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
      }
    });
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Yeni Etkinlik</h1>
        <Form schema={eventSchema} onSubmit={handleSubmit}>
          {(methods) => (
            <>
              <div className="space-y-4">
                <TextField name="name" label="Ad" required />
                <TextField name="description" label="Açıklama" multiline rows={4} />
                <TextField name="location" label="Konum" />
                {eventTypes.length > 0 && (
                  <Select name="eventTypeId" label="Etkinlik Tipi" options={eventTypes} required />
                )}
                <TextField name="formUrl" label="Form URL" type="url" />
                <DatePicker name="startDate" label="Başlangıç Tarihi" required />
                <DatePicker name="endDate" label="Bitiş Tarihi" />
                <TextField name="linkedin" label="LinkedIn URL" type="url" />
                <FileUpload name="coverImage" label="Kapak Resmi" accept="image/*" />
              </div>
              <div className="mt-6 flex gap-4">
                <Button type="submit" disabled={isPending}>
                  {isPending ? 'Kaydediliyor...' : 'Kaydet'}
                </Button>
                <Button href="/events" variant="secondary">
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

