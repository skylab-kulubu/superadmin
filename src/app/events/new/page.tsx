'use client';

import { useState, useTransition, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Form } from '@/components/forms/Form';
import { TextField } from '@/components/forms/TextField';
import { Textarea } from '@/components/forms/Textarea';
import { DatePicker } from '@/components/forms/DatePicker';
import { Select } from '@/components/forms/Select';
import { FileUpload } from '@/components/forms/FileUpload';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/forms/Checkbox';
import { Modal } from '@/components/ui/Modal';
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
  coverImage: z.custom<File | undefined>((val) => val === undefined || val instanceof File).optional(),
});

const eventTypeSchema = z.object({
  name: z.string().min(2, 'En az 2 karakter olmalı'),
});

export default function NewEventPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [eventTypes, setEventTypes] = useState<{ value: string; label: string }[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreatingEventType, setIsCreatingEventType] = useState(false);
  const eventFormMethodsRef = useRef<any>(null);

  const loadEventTypes = () => {
    eventTypesApi.getAll().then((response) => {
      if (response.success && response.data) {
        setEventTypes(response.data.map((et) => ({ value: et.id, label: et.name })));
      }
    }).catch((error) => {
      console.error('Event types fetch error:', error);
    });
  };

  useEffect(() => {
    loadEventTypes();
  }, []);

  const handleSubmit = async (data: z.infer<typeof eventSchema>) => {
    startTransition(async () => {
      try {
        const coverImage = data.coverImage;
        const eventData = {
          name: data.name,
          description: data.description || undefined,
          location: data.location ?? '',
          eventTypeId: data.eventTypeId,
          formUrl: data.formUrl || undefined,
          startDate: new Date(data.startDate).toISOString(),
          endDate: data.endDate ? new Date(data.endDate).toISOString() : undefined,
          linkedin: data.linkedin || undefined,
          active: data.active || undefined,
          competitionId: data.competitionId || undefined,
        };
        await eventsApi.create(eventData, coverImage);
        
        router.push('/events');
      } catch (error) {
        console.error('Event creation error:', error);
        alert('Etkinlik oluşturulurken hata oluştu: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
      }
    });
  };

  const handleCreateEventType = async (data: z.infer<typeof eventTypeSchema>) => {
    setIsCreatingEventType(true);
    try {
      const response = await eventTypesApi.create({ name: data.name });
      if (response.success && response.data) {
        loadEventTypes();
        eventFormMethodsRef.current?.setValue?.('eventTypeId', response.data.id);
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error('Event type creation error:', error);
      alert('Etkinlik tipi oluşturulurken hata oluştu: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
    } finally {
      setIsCreatingEventType(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Yeni Etkinlik</h1>
        <Form schema={eventSchema} onSubmit={handleSubmit} defaultValues={{ coverImage: undefined, eventTypeId: '' }}>
          {(methods) => {
            // Form method'larını ref'te sakla (state set etme, render sırasında setState hatasına yol açar)
            eventFormMethodsRef.current = methods;
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
                  <FileUpload name="coverImage" label="Kapak Resmi" accept="image/*" />
                <Checkbox name="active" label="Aktif" />
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
            );
          }}
        </Form>

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Yeni Etkinlik Tipi"
        >
          <Form schema={eventTypeSchema} onSubmit={(data) => handleCreateEventType(data)}>
            {(methods) => (
              <>
                <div className="space-y-4">
                  <TextField name="name" label="Ad" required placeholder="Workshop, Seminer, vb." />
                </div>
                <div className="mt-6 flex gap-4">
                  <Button type="submit" disabled={isCreatingEventType}>
                    {isCreatingEventType ? 'Kaydediliyor...' : 'Kaydet'}
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                    İptal
                  </Button>
                </div>
              </>
            )}
          </Form>
        </Modal>
      </div>
    </AppShell>
  );
}

