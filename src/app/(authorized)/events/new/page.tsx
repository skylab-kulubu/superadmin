'use client';

import { useState, useTransition, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

import { PageHeader } from '@/components/layout/PageHeader';
import { Form } from '@/components/forms/Form';
import { TextField } from '@/components/forms/TextField';
import { Textarea } from '@/components/forms/Textarea';
import { DatePicker } from '@/components/forms/DatePicker';
import { Select } from '@/components/forms/Select';
import { FileUpload } from '@/components/forms/FileUpload';
import { Button } from '@/components/ui/Button';
import { FormActions } from '@/components/ui/FormActions';
import { Checkbox } from '@/components/forms/Checkbox';
import { Modal } from '@/components/ui/Modal';
import { z } from 'zod';
import { eventsApi } from '@/lib/api/events';
import { eventDaysApi } from '@/lib/api/eventDays';
import { eventTypesApi } from '@/lib/api/event-types';
import { seasonsApi } from '@/lib/api/seasons';
import { convertGMT3ToGMT0, getCurrentDateTimeGMT3 } from '@/lib/utils/date';
import {
  canEditFullEventMetadata,
  canOperateEventScheduling,
  eventTypeMatchesLeaderScope,
  getLeaderEventType,
} from '@/lib/utils/permissions';
import { useAuth } from '@/context/AuthContext';
import type { UserDto } from '@/types/api';

const eventSchema = z.object({
  name: z.string().min(2, 'En az 2 karakter olmalı'),
  description: z.string().optional(),
  location: z.string().optional(),
  eventTypeId: z.string().min(1, 'Etkinlik tipi seçiniz'),
  seasonId: z.string().optional(),
  capacity: z.preprocess(
    (val) => (val === '' || val === undefined ? undefined : Number(val)),
    z.number().int().positive().optional(),
  ),
  formUrl: z.string().url().optional().or(z.literal('')),
  startDate: z.string(),
  endDate: z.string().min(1, 'Bitiş tarihi zorunludur'),
  linkedin: z.string().url().optional().or(z.literal('')),
  active: z.boolean().default(true),
  competitionId: z.string().optional(),
  isRanked: z.boolean().optional(),
  prizeInfo: z.string().optional(),
  coverImage: z.custom<File>((val) => val instanceof File, 'Kapak resmi zorunludur'),
});

const eventTypeSchema = z.object({
  name: z.string().min(2, 'En az 2 karakter olmalı'),
});

type EventDayDraft = {
  name: string;
  startDate: string;
  endDate: string;
};

export default function NewEventPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [eventTypes, setEventTypes] = useState<{ value: string; label: string }[]>([]);
  const [seasons, setSeasons] = useState<{ value: string; label: string }[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreatingEventType, setIsCreatingEventType] = useState(false);
  const [manualDays, setManualDays] = useState<EventDayDraft[]>([]);
  const eventFormMethodsRef = useRef<any>(null);
  const { user: currentUser, loading: authLoading } = useAuth();

  /** Lider olmayan ekip üyesi doğrudan URL ile giremesin */
  useEffect(() => {
    if (authLoading) return;
    if (!canOperateEventScheduling(currentUser ?? null)) {
      router.replace('/events');
    }
  }, [authLoading, currentUser, router]);
  const [leaderEventTypeId, setLeaderEventTypeId] = useState<string | null>(null);
  const closeEventTypeModal = () => setIsModalOpen(false);
  const showFullEventFields = canEditFullEventMetadata(currentUser);

  const checkLeaderRole = (user: UserDto, types: { value: string; label: string }[]) => {
    const leaderTypeName = getLeaderEventType(user);
    if (leaderTypeName) {
      const matchedType = types.find((t) => eventTypeMatchesLeaderScope(t.label, leaderTypeName));
      if (matchedType) {
        setLeaderEventTypeId(matchedType.value);
        if (eventFormMethodsRef.current) {
          eventFormMethodsRef.current.setValue('eventTypeId', matchedType.value);
        }
      }
    }
  };

  const reloadEventTypesList = useCallback(() => {
    eventTypesApi
      .getAll()
      .then((response) => {
        if (response.success && response.data) {
          const types = response.data.map((et) => ({ value: et.id, label: et.name }));
          setEventTypes(types);
          if (currentUser) {
            checkLeaderRole(currentUser, types);
          }
        }
      })
      .catch((error) => {
        console.error('Event types fetch error:', error);
      });
  }, [currentUser]);

  useEffect(() => {
    reloadEventTypesList();
  }, [reloadEventTypesList]);

  useEffect(() => {
    if (!canEditFullEventMetadata(currentUser)) {
      setSeasons([]);
      return;
    }
    seasonsApi
      .getAll()
      .then((response) => {
        if (response.success && response.data) {
          setSeasons(response.data.map((s) => ({ value: s.id, label: s.name })));
        }
      })
      .catch((error) => {
        console.error('Seasons fetch error:', error);
      });
  }, [currentUser]);

  const addManualDay = () => {
    setManualDays((prev) => [
      ...prev,
      {
        name: `${prev.length + 1}. Gün`,
        startDate: getCurrentDateTimeGMT3(),
        endDate: getCurrentDateTimeGMT3(),
      },
    ]);
  };

  const updateManualDay = (index: number, field: keyof EventDayDraft, value: string) => {
    setManualDays((prev) => prev.map((day, i) => (i === index ? { ...day, [field]: value } : day)));
  };

  const removeManualDay = (index: number) => {
    setManualDays((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (data: z.infer<typeof eventSchema>) => {
    if (!canOperateEventScheduling(currentUser ?? null)) {
      router.replace('/events');
      return;
    }

    const normalizedDays = manualDays.map((day) => ({
      name: day.name.trim(),
      startDate: day.startDate,
      endDate: day.endDate,
    }));

    for (let i = 0; i < normalizedDays.length; i++) {
      const day = normalizedDays[i];
      if (!day.name || !day.startDate || !day.endDate) {
        alert(`${i + 1}. gün için ad, başlangıç ve bitiş tarihini doldurun.`);
        return;
      }
      if (new Date(day.startDate).getTime() > new Date(day.endDate).getTime()) {
        alert(`${i + 1}. gün için bitiş tarihi başlangıçtan önce olamaz.`);
        return;
      }
    }

    startTransition(async () => {
      try {
        const coverImage = data.coverImage;
        const privileged = canEditFullEventMetadata(currentUser);
        const eventData = {
          name: data.name,
          description: data.description || undefined,
          location: data.location ?? '',
          eventTypeId: data.eventTypeId,
          seasonId: privileged ? data.seasonId || undefined : undefined,
          capacity: data.capacity,
          formUrl: privileged ? data.formUrl || undefined : undefined,
          startDate: convertGMT3ToGMT0(data.startDate),
          endDate: convertGMT3ToGMT0(data.endDate),
          linkedin: privileged ? data.linkedin || undefined : undefined,
          active: data.active,
          isRanked: privileged ? (data.isRanked ?? false) : false,
          prizeInfo: privileged ? data.prizeInfo || undefined : undefined,
          competitionId: privileged ? data.competitionId || undefined : undefined,
        };

        const eventCreateRes = await eventsApi.create(eventData, coverImage);
        const createdEventId = eventCreateRes.data?.id;

        if (!eventCreateRes.success || !createdEventId) {
          throw new Error(eventCreateRes.message || 'Etkinlik oluşturulamadı.');
        }

        for (const day of normalizedDays) {
          await eventDaysApi.create({
            eventId: createdEventId,
            name: day.name,
            startDate: convertGMT3ToGMT0(day.startDate),
            endDate: convertGMT3ToGMT0(day.endDate),
          });
        }

        router.push('/events');
      } catch (error) {
        console.error('Event creation error:', error);
        alert(
          'Etkinlik oluşturulurken hata oluştu: ' +
            (error instanceof Error ? error.message : 'Bilinmeyen hata'),
        );
      }
    });
  };

  const handleCreateEventType = async (data: z.infer<typeof eventTypeSchema>) => {
    setIsCreatingEventType(true);
    try {
      const response = await eventTypesApi.create({
        name: data.name,
      });
      if (response.success && response.data) {
        void reloadEventTypesList();
        eventFormMethodsRef.current?.setValue?.('eventTypeId', response.data.id);
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error('Event type creation error:', error);
      alert(
        'Etkinlik tipi oluşturulurken hata oluştu: ' +
          (error instanceof Error ? error.message : 'Bilinmeyen hata'),
      );
    } finally {
      setIsCreatingEventType(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Yeni Etkinlik" />

      <div className="mx-auto max-w-3xl">
        <div className="bg-light border-dark-200 rounded-lg border p-4 shadow">
          <Form
            schema={eventSchema}
            onSubmit={handleSubmit}
            defaultValues={{
              coverImage: undefined,
              eventTypeId: leaderEventTypeId || '',
              seasonId: '',
              capacity: undefined,
              startDate: getCurrentDateTimeGMT3(),
              endDate: getCurrentDateTimeGMT3(),
              isRanked: false,
            }}
          >
            {(methods) => {
              eventFormMethodsRef.current = methods;
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
                        <TextField
                          name="name"
                          label="Ad"
                          required
                          placeholder="Yazılım Geliştirme Workshop'u"
                        />
                        <div className="relative">
                          <Select
                            name="eventTypeId"
                            label="Etkinlik Tipi"
                            options={eventTypes}
                            required
                            disabled={!!leaderEventTypeId}
                          />
                          {!leaderEventTypeId && showFullEventFields && (
                            <button
                              type="button"
                              onClick={() => setIsModalOpen(true)}
                              className="text-brand absolute top-0 right-0 text-xs font-medium hover:underline"
                            >
                              + Yeni Tip
                            </button>
                          )}
                        </div>
                        <TextField
                          name="location"
                          label="Konum"
                          placeholder="YTÜ Davutpaşa Kampüsü"
                        />
                        {showFullEventFields && (
                          <Select
                            name="seasonId"
                            label="Sezon"
                            options={seasons}
                            placeholder="Sezon Seçiniz (Opsiyonel)"
                          />
                        )}
                        <TextField
                          name="capacity"
                          label="Kapasite"
                          type="number"
                          placeholder="500"
                        />
                        {showFullEventFields ? (
                          <>
                            <TextField
                              name="formUrl"
                              label="Form URL"
                              type="url"
                              placeholder="https://forms.google.com/..."
                            />
                            <TextField
                              name="prizeInfo"
                              label="Ödül Bilgisi"
                              placeholder="1.ye laptop, 2.ye tablet..."
                            />
                          </>
                        ) : null}
                        <div className="col-span-full flex flex-wrap items-center gap-4 pt-2 sm:pt-8">
                          {showFullEventFields ? (
                            <Checkbox name="isRanked" label="Sıralamalı Etkinlik" />
                          ) : null}
                          <Checkbox name="active" label="Aktif mi?" />
                        </div>
                      </div>
                      <div className="mt-4">
                        <Textarea
                          name="description"
                          label="Açıklama"
                          rows={4}
                          placeholder="Etkinlik hakkında detaylı bilgi..."
                        />
                      </div>
                    </div>

                    <div className="border-dark-200 border-t pt-5">
                      <h3 className="text-dark-800 mb-3 text-sm font-semibold">Tarih ve Zaman</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <DatePicker name="startDate" label="Başlangıç Tarihi" required />
                        <DatePicker name="endDate" label="Bitiş Tarihi" required />
                      </div>
                    </div>

                    <div className="border-dark-200 border-t pt-5">
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <h3 className="text-dark-800 text-sm font-semibold">
                          Etkinlik Günleri (Opsiyonel)
                        </h3>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={addManualDay}
                          className="!px-3 !py-1.5 text-xs"
                        >
                          + Gün Ekle
                        </Button>
                      </div>
                      <p className="text-dark-500 mb-4 text-xs">
                        Günler otomatik üretilmez. Lütfen etkinlik günlerini manuel olarak girin.
                      </p>
                      <div className="space-y-3">
                        {manualDays.map((day, index) => (
                          <div
                            key={`${index}-${day.name}`}
                            className="border-dark-200 bg-dark-50 rounded-md border p-3"
                          >
                            <div className="mb-3 flex items-center justify-between gap-2">
                              <p className="text-dark-700 text-xs font-medium">Gün {index + 1}</p>
                              <Button
                                type="button"
                                variant="outlineDanger"
                                onClick={() => removeManualDay(index)}
                                className="!px-2.5 !py-1 text-xs"
                              >
                                Sil
                              </Button>
                            </div>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                              <div>
                                <label className="text-dark mb-1 block text-sm font-medium">
                                  Gün Adı
                                </label>
                                <input
                                  type="text"
                                  value={day.name}
                                  onChange={(e) => updateManualDay(index, 'name', e.target.value)}
                                  placeholder="1. Gün"
                                  className="text-dark placeholder:text-dark border-dark-200 bg-light focus:ring-brand w-full rounded-md border px-3 py-2 text-sm placeholder:opacity-60 focus:border-transparent focus:ring-2 focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="text-dark mb-1 block text-sm font-medium">
                                  Başlangıç
                                </label>
                                <input
                                  type="datetime-local"
                                  value={day.startDate}
                                  onChange={(e) =>
                                    updateManualDay(index, 'startDate', e.target.value)
                                  }
                                  className="text-dark border-dark-200 bg-light focus:ring-brand w-full rounded-md border px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="text-dark mb-1 block text-sm font-medium">
                                  Bitiş
                                </label>
                                <input
                                  type="datetime-local"
                                  value={day.endDate}
                                  onChange={(e) =>
                                    updateManualDay(index, 'endDate', e.target.value)
                                  }
                                  className="text-dark border-dark-200 bg-light focus:ring-brand w-full rounded-md border px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:outline-none"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                        {manualDays.length === 0 && (
                          <p className="text-dark-500 border-dark-200 rounded-md border border-dashed px-3 py-4 text-center text-sm">
                            Gün eklemek zorunlu değil. İsterseniz yukarıdan '+ Gün Ekle' ile manuel
                            gün tanımlayabilirsiniz.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="border-dark-200 border-t pt-5">
                      <h3 className="text-dark-800 mb-3 text-sm font-semibold">Ek Bilgiler</h3>
                      <div className="space-y-4">
                        {showFullEventFields ? (
                          <TextField
                            name="linkedin"
                            label="LinkedIn URL"
                            type="url"
                            placeholder="https://www.linkedin.com/events/..."
                          />
                        ) : null}
                        <FileUpload name="coverImage" label="Kapak Resmi" accept="image/*" />
                      </div>
                    </div>
                  </div>
                  <FormActions
                    cancel={
                      <Button href="/events" variant="outlineDanger">
                        İptal
                      </Button>
                    }
                    submit={
                      <Button type="submit" variant="outlineBrand" disabled={isPending}>
                        {isPending ? 'Kaydediliyor...' : 'Kaydet'}
                      </Button>
                    }
                  />
                </>
              );
            }}
          </Form>
        </div>
      </div>

      {showFullEventFields ? (
        <Modal isOpen={isModalOpen} onClose={closeEventTypeModal} title="Yeni Etkinlik Tipi">
          <Form schema={eventTypeSchema} onSubmit={(data) => handleCreateEventType(data)}>
            {(methods) => (
              <>
                <div className="space-y-4">
                  <TextField name="name" label="Ad" required placeholder="Workshop, Seminer, vb." />
                </div>
                <FormActions
                  cancel={
                    <Button
                      type="button"
                      variant="outlineDanger"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        closeEventTypeModal();
                      }}
                    >
                      İptal
                    </Button>
                  }
                  submit={
                    <Button type="submit" variant="outlineBrand" disabled={isCreatingEventType}>
                      {isCreatingEventType ? 'Kaydediliyor...' : 'Kaydet'}
                    </Button>
                  }
                />
              </>
            )}
          </Form>
        </Modal>
      ) : null}
    </div>
  );
}
