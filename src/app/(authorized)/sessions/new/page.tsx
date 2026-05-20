'use client';

import React, { useEffect, useState, useTransition, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { Form } from '@/components/forms/Form';
import { TextField } from '@/components/forms/TextField';
import { Textarea } from '@/components/forms/Textarea';
import { Select } from '@/components/forms/Select';
import { Button } from '@/components/ui/Button';
import { FormActions } from '@/components/ui/FormActions';
import { z } from 'zod';
import { sessionsApi } from '@/lib/api/sessions';
import { eventDaysApi } from '@/lib/api/eventDays';
import { eventsApi } from '@/lib/api/events';
import { useAuth } from '@/context/AuthContext';
import {
  canOperateEventScheduling,
  canOperateEventSchedulingOnEvent,
} from '@/lib/utils/permissions';
import type { EventDto, GetEventDayResponseDto } from '@/types/api';
import { zOptionalLinkedInUrl } from '@/lib/utils/linkedinZod';

const SESSION_TYPES = [
  'WORKSHOP',
  'PRESENTATION',
  'PANEL',
  'KEYNOTE',
  'NETWORKING',
  'OTHER',
  'CTF',
  'HACKATHON',
  'JAM',
] as const;

const sessionSchema = z.object({
  eventDayId: z.string().min(1, 'Gün seçiniz'),
  title: z.string().min(2, 'En az 2 karakter olmali'),
  speakerName: z.string().optional(),
  speakerLinkedin: zOptionalLinkedInUrl,
  description: z.string().optional(),
  startTime: z.string().min(1, 'Baslangic saati zorunlu'),
  endTime: z.string().optional(),
  sessionType: z.enum(SESSION_TYPES).optional(),
});

function sortDaysByStart(d: GetEventDayResponseDto[]) {
  return [...d].sort(
    (a, b) => new Date(a.startDate || 0).getTime() - new Date(b.startDate || 0).getTime(),
  );
}

export default function NewSessionPage() {
  return (
    <Suspense fallback={<SessionsNewSkeleton />}>
      <NewSessionPageContent />
    </Suspense>
  );
}

function SessionsNewSkeleton() {
  return (
    <div className="space-y-6">
      <PageHeader title="Yeni Oturum" />
      <div className="text-dark-500 mx-auto max-w-3xl px-2 text-sm">Yükleniyor…</div>
    </div>
  );
}

function NewSessionPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get('eventId') || '';
  const { user, loading: authLoading } = useAuth();

  const [isPending, startTransition] = useTransition();
  const [eventDays, setEventDays] = useState<GetEventDayResponseDto[]>([]);
  const [event, setEvent] = useState<EventDto | null>(null);
  const [daysBootstrap, setDaysBootstrap] = useState<'idle' | 'loading' | 'ready' | 'error'>(
    'idle',
  );
  const [daysError, setDaysError] = useState<string | null>(null);
  const [speakerPhoto, setSpeakerPhoto] = useState<File | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!canOperateEventScheduling(user ?? null)) {
      router.replace(eventId ? `/events/${eventId}` : '/events');
    }
  }, [authLoading, user, router, eventId]);

  useEffect(() => {
    if (authLoading || !user || !canOperateEventScheduling(user)) return;
    if (!eventId || !event) return;
    if (!canOperateEventSchedulingOnEvent(user, event.type?.name)) {
      router.replace(`/events/${eventId}`);
    }
  }, [authLoading, user, eventId, event, router]);

  useEffect(() => {
    if (!eventId) {
      setDaysBootstrap('idle');
      return;
    }

    let cancelled = false;
    setDaysBootstrap('loading');
    setDaysError(null);

    (async () => {
      try {
        const [eventRes, daysRes] = await Promise.all([
          eventsApi.getById(eventId),
          eventDaysApi.getByEventId(eventId),
        ]);

        if (cancelled) return;

        if (eventRes.success && eventRes.data) {
          setEvent(eventRes.data);
        } else {
          setEvent(null);
        }

        const days = daysRes.success && daysRes.data ? sortDaysByStart(daysRes.data) : [];

        setEventDays(days);
        setDaysBootstrap('ready');
      } catch {
        if (!cancelled) {
          setDaysError('Günler yüklenirken bir hata oluştu.');
          setDaysBootstrap('error');
          setEventDays([]);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [eventId]);

  const handleSubmit = async (data: z.infer<typeof sessionSchema>) => {
    if (!canOperateEventSchedulingOnEvent(user ?? null, event?.type?.name)) {
      router.replace(eventId ? `/events/${eventId}` : '/events');
      return;
    }
    startTransition(async () => {
      try {
        const selectedDay = eventDays.find((d) => d.id === data.eventDayId);
        if (!selectedDay || !selectedDay.startDate) {
          throw new Error('Seçilen günün tarihi bulunamadı.');
        }

        const dayDate = new Date(selectedDay.startDate);
        const yyyy = dayDate.getFullYear();
        const mm = String(dayDate.getMonth() + 1).padStart(2, '0');
        const dd = String(dayDate.getDate()).padStart(2, '0');

        const startParts = data.startTime.split(':');
        const startHH = startParts[0] ?? '00';
        const startMM = startParts[1] ?? '00';
        const fullStartDate = new Date(`${yyyy}-${mm}-${dd}T${startHH}:${startMM}:00`);

        let fullEndDate: Date | undefined = undefined;
        if (data.endTime) {
          const endParts = data.endTime.split(':');
          const endHH = endParts[0] ?? '00';
          const endMM = endParts[1] ?? '00';
          fullEndDate = new Date(`${yyyy}-${mm}-${dd}T${endHH}:${endMM}:00`);
        }

        const linkedin =
          typeof data.speakerLinkedin === 'string' && data.speakerLinkedin.trim() !== ''
            ? data.speakerLinkedin.trim()
            : undefined;

        await sessionsApi.create(
          {
            eventDayId: data.eventDayId,
            title: data.title,
            speakerName: data.speakerName || undefined,
            speakerLinkedin: linkedin,
            description: data.description || undefined,
            startTime: fullStartDate.toISOString(),
            endTime: fullEndDate ? fullEndDate.toISOString() : undefined,
            sessionType: data.sessionType,
          },
          speakerPhoto ?? undefined,
        );

        router.push(`/events/${eventId}`);
      } catch (error) {
        alert(
          'Oturum olusturulurken hata olustu: ' +
            (error instanceof Error ? error.message : 'Bilinmeyen hata'),
        );
      }
    });
  };

  const dayOptions = eventDays.map((day, index) => {
    const dateStr = day.startDate ? new Date(day.startDate).toLocaleDateString('tr-TR') : '';
    return {
      value: day.id,
      label: `${index + 1}. Gün${dateStr ? ` (${dateStr})` : ''}`,
    };
  });

  const daySelectLoading = daysBootstrap === 'loading';

  return (
    <div className="space-y-6">
      <PageHeader title="Yeni Oturum" description={event?.name} />
      <div className="mx-auto max-w-3xl">
        <div className="bg-light border-dark-200 rounded-lg border p-4 shadow">
          {eventId ? (
            <>
              {event && (
                <div className="border-dark-200 bg-dark-50 mb-5 rounded-lg border px-4 py-3 text-sm">
                  <p className="text-dark-800 font-medium">{event.name}</p>
                  {event.location && <p className="text-dark-500 mt-0.5">{event.location}</p>}
                </div>
              )}
              {daysError && (
                <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                  {daysError}
                </div>
              )}
              {daysBootstrap === 'ready' && eventDays.length === 0 && !daysError && event && (
                <div className="border-warning-200 bg-warning-50 text-warning-900 mb-4 rounded-md border px-4 py-3 text-sm">
                  Bu etkinlik için gün tanımlı değil. Oturum eklemeden önce etkinlik günlerini
                  etkinlik detayındaki 'Günleri Yönet' ekranından manuel olarak tanımlayın.
                </div>
              )}
              {daySelectLoading ? (
                <div className="text-dark-600 py-8 text-center text-sm">
                  Etkinlik ve günler yükleniyor…
                </div>
              ) : (
                <Form schema={sessionSchema} onSubmit={handleSubmit}>
                  {() => (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <Select
                          name="eventDayId"
                          label="Oturum günü"
                          options={dayOptions}
                          required
                          disabled={eventDays.length === 0}
                        />
                        <TextField
                          name="title"
                          label="Başlık"
                          required
                          placeholder="Oturum başlığı"
                        />
                        <TextField name="speakerName" label="Konuşmacı adı" />
                        <TextField
                          name="speakerLinkedin"
                          label="Konuşmacı LinkedIn"
                          type="text"
                          placeholder="linkedin.com/in/… veya tam URL"
                        />
                        <div className="col-span-2">
                          <label className="text-dark mb-1 block text-sm font-medium">
                            Konuşmacı fotoğrafı (isteğe bağlı)
                          </label>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            className="text-dark bg-light border-dark-200 file:bg-brand-100 file:text-brand-800 w-full cursor-pointer rounded-md border px-2 py-2 text-sm file:mr-3 file:cursor-pointer file:rounded file:border-0 file:px-3 file:py-1 file:text-sm file:font-medium"
                            onChange={(ev) => setSpeakerPhoto(ev.target.files?.[0] ?? null)}
                          />
                        </div>
                        <Select
                          name="sessionType"
                          label="Oturum tipi"
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
                        <div className="col-span-2">
                          <div className="flex gap-4">
                            <div className="flex-1">
                              <TextField
                                name="startTime"
                                label="Başlangıç saati"
                                type="time"
                                required
                              />
                            </div>
                            <div className="flex-1">
                              <TextField name="endTime" label="Bitiş saati" type="time" />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4">
                        <Textarea name="description" label="Açıklama" rows={4} />
                      </div>
                      <FormActions
                        cancel={
                          <Button
                            href={eventId ? `/events/${eventId}` : '/sessions'}
                            variant="outlineDanger"
                          >
                            İptal
                          </Button>
                        }
                        submit={
                          <Button
                            type="submit"
                            variant="outlineBrand"
                            disabled={isPending || eventDays.length === 0}
                          >
                            {isPending ? 'Kaydediliyor...' : 'Kaydet'}
                          </Button>
                        }
                      />
                    </>
                  )}
                </Form>
              )}
            </>
          ) : (
            <div className="text-dark-500 py-8 text-center">
              <p>Etkinlik bilgisi bulunamadı. Lütfen bir etkinlik sayfasından oturum ekleyin.</p>
              <Button href="/events" variant="secondary" className="mt-4">
                Etkinliklere Dön
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
