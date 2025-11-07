'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { Form } from '@/components/forms/Form';
import { TextField } from '@/components/forms/TextField';
import { Textarea } from '@/components/forms/Textarea';
import { Select } from '@/components/forms/Select';
import { Button } from '@/components/ui/Button';
import { z } from 'zod';
import { sessionsApi } from '@/lib/api/sessions';
import { eventsApi } from '@/lib/api/events';
import { convertGMT3ToGMT0, getCurrentDateTimeGMT3 } from '@/lib/utils/date';

const sessionSchema = z.object({
  eventId: z.string().min(1, 'Etkinlik seçiniz'),
  title: z.string().min(2, 'En az 2 karakter olmalı'),
  speakerName: z.string().optional(),
  speakerLinkedin: z.string().url().optional().or(z.literal('')),
  description: z.string().optional(),
  startTime: z.string(),
  endTime: z.string().optional(),
  orderIndex: z.string().optional().transform((val) => val === '' ? undefined : (val ? parseInt(val) : undefined)),
  sessionType: z.enum(['WORKSHOP', 'PRESENTATION', 'PANEL', 'KEYNOTE', 'NETWORKING', 'OTHER', 'CTF', 'HACKATHON', 'JAM']).optional(),
});

export default function NewSessionPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [events, setEvents] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    eventsApi.getAll().then((response) => {
      if (response.success && response.data) {
        setEvents(response.data.map((event) => ({ value: event.id, label: event.name })));
      }
    }).catch((error) => {
      console.error('Events fetch error:', error);
    });
  }, []);

  const handleSubmit = async (data: z.infer<typeof sessionSchema>) => {
    startTransition(async () => {
      try {
        await sessionsApi.create({
          eventId: data.eventId,
          title: data.title,
          speakerName: data.speakerName || undefined,
          speakerLinkedin: data.speakerLinkedin || undefined,
          description: data.description || undefined,
          startTime: convertGMT3ToGMT0(data.startTime),
          endTime: data.endTime ? convertGMT3ToGMT0(data.endTime) : undefined,
          orderIndex: data.orderIndex,
          sessionType: data.sessionType,
        });
        router.push('/sessions');
      } catch (error) {
        console.error('Session creation error:', error);
        alert('Oturum oluşturulurken hata oluştu: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
      }
    });
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="Yeni Oturum"
          description="Sisteme yeni oturum ekleyin"
        />

        <div className="max-w-3xl mx-auto">
        <div className="bg-light p-4 rounded-lg shadow border border-dark-200">
          <Form schema={sessionSchema} onSubmit={handleSubmit} defaultValues={{ 
          eventId: '',
          startTime: getCurrentDateTimeGMT3(),
        }}>
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
                  <Select 
                    name="eventId" 
                    label="Etkinlik" 
                    options={events}
                    required 
                  />
                  <TextField name="title" label="Başlık" required placeholder="React ile Modern Web Geliştirme" />
                  <TextField name="speakerName" label="Konuşmacı Adı" placeholder="Ahmet Yılmaz" />
                  <TextField name="speakerLinkedin" label="Konuşmacı LinkedIn" type="url" placeholder="https://www.linkedin.com/in/..." />
                  <Select 
                    name="sessionType" 
                    label="Oturum Tipi" 
                    options={[
                      { value: 'WORKSHOP', label: 'Workshop' },
                      { value: 'PRESENTATION', label: 'Sunum' },
                      { value: 'PANEL', label: 'Panel' },
                      { value: 'KEYNOTE', label: 'Keynote' },
                      { value: 'NETWORKING', label: 'Networking' },
                      { value: 'CTF', label: 'CTF' },
                      { value: 'HACKATHON', label: 'Hackathon' },
                      { value: 'JAM', label: 'Jam' },
                      { value: 'OTHER', label: 'Diğer' },
                    ]}
                  />
                        <TextField name="orderIndex" label="Sıra" type="number" placeholder="1" />
                      </div>
                      <div className="mt-4">
                        <Textarea name="description" label="Açıklama" rows={4} placeholder="Oturum hakkında detaylı bilgi..." />
                      </div>
                    </div>

                    <div className="border-t border-dark-200 pt-5">
                      <h3 className="text-sm font-semibold text-dark-800 mb-3">Tarih ve Zaman</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <TextField name="startTime" label="Başlangıç Zamanı" type="datetime-local" required max="9999-12-31T23:59" />
                        <TextField name="endTime" label="Bitiş Zamanı" type="datetime-local" max="9999-12-31T23:59" />
                      </div>
                    </div>
                </div>
                  <div className="flex justify-between items-center gap-3 mt-6 pt-5 border-t border-dark-200">
                    <Button href="/sessions" variant="secondary" className="text-red-500 hover:bg-red-500 hover:text-white bg-transparent border-red-500">
                      İptal
                    </Button>
                    <Button type="submit" disabled={isPending} className="!text-brand hover:!bg-brand hover:!text-white !bg-transparent border-brand">
                    {isPending ? 'Kaydediliyor...' : 'Kaydet'}
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

