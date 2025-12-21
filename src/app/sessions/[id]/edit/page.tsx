'use client';

// =====================================================
// BU SAYFA BAKIM AŞAMASINDA - EKSİK ENDPOINT
// Sebep: GET /api/sessions/{id} endpoint'i backend'de yok
// =====================================================

import { PageHeader } from '@/components/layout/PageHeader';

export default function EditSessionPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="space-y-6">
      <PageHeader title="Oturumu Düzenle" description="Oturum bilgilerini güncelleyin" />

      <div className="flex h-64 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 p-4">
        <div className="text-center">
          <p className="text-lg font-semibold text-amber-800">🚧 Bakım Aşamasında</p>
          <p className="mt-2 text-amber-600">Bu sayfa şu anda bakım aşamasındadır.</p>
          <p className="text-sm text-amber-500">(Eksik Endpoint: GET /api/sessions/:id)</p>
        </div>
      </div>
    </div>
  );
}

/*
// ====================== YORUM SATIRINA ALINAN KOD ======================

import { useState, useTransition, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';

import { Form } from '@/components/forms/Form';
import { TextField } from '@/components/forms/TextField';
import { Textarea } from '@/components/forms/Textarea';
import { Select } from '@/components/forms/Select';
import { Button } from '@/components/ui/Button';
import { z } from 'zod';
import { sessionsApi } from '@/lib/api/sessions';
import { eventsApi } from '@/lib/api/events';
import { formatGMT0ToLocalInput, convertGMT3ToGMT0 } from '@/lib/utils/date';
import { getLeaderEventType } from '@/lib/utils/permissions';
import { UserDto } from '@/types/api';

const sessionSchema = z.object({
  eventId: z.string().min(1, 'Etkinlik seçiniz'),
  title: z.string().min(2, 'En az 2 karakter olmalı'),
  speakerName: z.string().optional(),
  speakerLinkedin: z.string().url().optional().or(z.literal('')),
  description: z.string().optional(),
  startTime: z.string(),
  endTime: z.string().optional(),
  orderIndex: z
    .string()
    .optional()
    .transform((val) => (val === '' ? undefined : val ? parseInt(val) : undefined)),
  sessionType: z
    .enum([
      'WORKSHOP',
      'PRESENTATION',
      'PANEL',
      'KEYNOTE',
      'NETWORKING',
      'OTHER',
      'CTF',
      'HACKATHON',
      'JAM',
    ])
    .optional(),
});


export default function EditSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [isPending, startTransition] = useTransition();
  const [events, setEvents] = useState<{ value: string; label: string; type?: string }[]>([]);
  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserDto | null>(null);

  useEffect(() => {
    // Fetch user
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
        }
      })
      .catch((err) => console.error('User fetch error:', err));

    // Fetch events
    eventsApi
      .getAll({ includeEventType: true })
      .then((response) => {
        if (response.success && response.data) {
          setEvents(
            response.data.map((event) => ({
              value: event.id,
              label: event.name,
              type: event.type?.name,
            })),
          );
        }
      })
      .catch((error) => {
        console.error('Events fetch error:', error);
      });

    // Fetch session details
    sessionsApi
      .getById(id)
      .then((response) => {
        if (response.success && response.data) {
          const session = response.data;
          setInitialData({
            eventId: session.event?.id || '',
            title: session.title,
            speakerName: session.speakerName || '',
            speakerLinkedin: session.speakerLinkedin || '',
            description: session.description || '',
            startTime: session.startTime ? formatGMT0ToLocalInput(session.startTime) : '',
            endTime: session.endTime ? formatGMT0ToLocalInput(session.endTime) : '',
            orderIndex: session.orderIndex?.toString() || '',
            sessionType: session.sessionType || 'OTHER',
          });
        } else {
          alert('Oturum bulunamadı veya yüklenirken hata oluştu.');
          router.push('/sessions');
        }
      })
      .catch((error) => {
        console.error('Session fetch error:', error);
        alert('Oturum yüklenirken hata oluştu.');
        router.push('/sessions');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id, router]);

  const handleSubmit = async (data: z.infer<typeof sessionSchema>) => {
    // Permission check
    if (currentUser) {
      const leaderType = getLeaderEventType(currentUser);
      if (leaderType) {
        // Find the selected event
        const selectedEvent = events.find((e) => e.value === data.eventId);

        if (selectedEvent && selectedEvent.type !== leaderType) {
          alert('Bu etkinlik için oturum düzenleme yetkiniz yok.');
          return;
        }
      }
    }

    startTransition(async () => {
      try {
        await sessionsApi.update(id, {
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
        console.error('Session update error:', error);
        alert(
          'Oturum güncellenirken hata oluştu: ' +
            (error instanceof Error ? error.message : 'Bilinmeyen hata'),
        );
      }
    });
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p>Yükleniyor...</p>
      </div>
    );
  }

  // Filter events for leader
  const filteredEvents =
    currentUser && getLeaderEventType(currentUser)
      ? events.filter((e) => e.type === getLeaderEventType(currentUser))
      : events;

  return (
    <div className="space-y-6">
      <PageHeader title="Oturumu Düzenle" description="Oturum bilgilerini güncelleyin" />

      <div className="mx-auto max-w-3xl">
        <div className="bg-light border-dark-200 rounded-lg border p-4 shadow">
          <Form schema={sessionSchema} onSubmit={handleSubmit} defaultValues={initialData}>
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
                        <Select name="eventId" label="Etkinlik" options={filteredEvents} required />
                        <TextField
                          name="title"
                          label="Başlık"
                          required
                          placeholder="React ile Modern Web Geliştirme"
                        />
                        <TextField
                          name="speakerName"
                          label="Konuşmacı Adı"
                          placeholder="Ahmet Yılmaz"
                        />
                        <TextField
                          name="speakerLinkedin"
                          label="Konuşmacı LinkedIn"
                          type="url"
                          placeholder="https://www.linkedin.com/in/..."
                        />
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
                        <Textarea
                          name="description"
                          label="Açıklama"
                          rows={4}
                          placeholder="Oturum hakkında detaylı bilgi..."
                        />
                      </div>
                    </div>

                    <div className="border-dark-200 border-t pt-5">
                      <h3 className="text-dark-800 mb-3 text-sm font-semibold">Tarih ve Zaman</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <TextField
                          name="startTime"
                          label="Başlangıç Zamanı"
                          type="datetime-local"
                          required
                          max="9999-12-31T23:59"
                        />
                        <TextField
                          name="endTime"
                          label="Bitiş Zamanı"
                          type="datetime-local"
                          max="9999-12-31T23:59"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="border-dark-200 mt-6 flex items-center justify-between gap-3 border-t pt-5">
                    <Button
                      href="/sessions"
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
  );
}
*/
