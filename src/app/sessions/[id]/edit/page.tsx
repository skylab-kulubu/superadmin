'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Form } from '@/components/forms/Form';
import { TextField } from '@/components/forms/TextField';
import { Textarea } from '@/components/forms/Textarea';
import { Select } from '@/components/forms/Select';
import { Button } from '@/components/ui/Button';
import { z } from 'zod';
import { sessionsApi } from '@/lib/api/sessions';
import { eventsApi } from '@/lib/api/events';
import type { SessionDto } from '@/types/api';

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

export default function EditSessionPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [isPending, startTransition] = useTransition();
  const [session, setSession] = useState<SessionDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    if (id) {
      Promise.all([
        sessionsApi.getById(id),
        eventsApi.getAll(),
      ]).then(([sessionResponse, eventsResponse]) => {
        if (sessionResponse.success && sessionResponse.data) {
          setSession(sessionResponse.data);
        } else {
          setError('Oturum bulunamadı');
        }
        if (eventsResponse.success && eventsResponse.data) {
          setEvents(eventsResponse.data.map((event) => ({ value: event.id, label: event.name })));
        }
        setLoading(false);
      }).catch((err) => {
        console.error('Session fetch error:', err);
        setError('Oturum yüklenirken hata oluştu');
        setLoading(false);
      });
    }
  }, [id]);

  const handleSubmit = async (data: z.infer<typeof sessionSchema>) => {
    startTransition(async () => {
      try {
        await sessionsApi.update(id, {
          eventId: data.eventId,
          title: data.title,
          speakerName: data.speakerName || undefined,
          speakerLinkedin: data.speakerLinkedin || undefined,
          description: data.description || undefined,
          startTime: new Date(data.startTime).toISOString(),
          endTime: data.endTime ? new Date(data.endTime).toISOString() : undefined,
          orderIndex: data.orderIndex,
          sessionType: data.sessionType,
        });
        router.push('/sessions');
      } catch (error) {
        console.error('Session update error:', error);
        alert('Oturum güncellenirken hata oluştu: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
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

  if (error || !session) {
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Hata</h2>
            <p className="text-red-700">{error || 'Oturum bulunamadı'}</p>
            <Button href="/sessions" variant="secondary" className="mt-4">
              Geri Dön
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  // Tarih formatını düzenle (datetime-local için)
  const formatDateTimeForInput = (dateString: string) => {
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
        <h1 className="text-2xl font-bold mb-6">Oturum Düzenle</h1>
        <Form 
          schema={sessionSchema} 
          onSubmit={handleSubmit} 
          defaultValues={{ 
            eventId: session.event?.id || '',
            title: session.title,
            speakerName: session.speakerName || '',
            speakerLinkedin: session.speakerLinkedin || '',
            description: session.description || '',
            startTime: formatDateTimeForInput(session.startTime),
            endTime: session.endTime ? formatDateTimeForInput(session.endTime) : '',
            orderIndex: session.orderIndex ?? undefined,
            sessionType: session.sessionType ?? undefined,
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
                  <Select 
                    name="eventId" 
                    label="Etkinlik" 
                    options={events}
                    required 
                  />
                  <TextField name="title" label="Başlık" required placeholder="React ile Modern Web Geliştirme" />
                  <TextField name="speakerName" label="Konuşmacı Adı" placeholder="Ahmet Yılmaz" />
                  <TextField name="speakerLinkedin" label="Konuşmacı LinkedIn" type="url" placeholder="https://www.linkedin.com/in/..." />
                  <Textarea name="description" label="Açıklama" rows={4} placeholder="Oturum hakkında detaylı bilgi..." />
                  <TextField name="startTime" label="Başlangıç Zamanı" type="datetime-local" required />
                  <TextField name="endTime" label="Bitiş Zamanı" type="datetime-local" />
                  <TextField name="orderIndex" label="Sıra" type="number" placeholder="1" />
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
                </div>
                <div className="mt-6 flex gap-4">
                  <Button type="submit" disabled={isPending}>
                    {isPending ? 'Güncelleniyor...' : 'Güncelle'}
                  </Button>
                  <Button href="/sessions" variant="secondary">
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

