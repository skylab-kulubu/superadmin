'use client';

import { useState, useTransition, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

import { PageHeader } from '@/components/layout/PageHeader';
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
import { convertGMT3ToGMT0, getCurrentDateTimeGMT3 } from '@/lib/utils/date';
import { getLeaderEventType } from '@/lib/utils/permissions';
import { UserDto } from '@/types/api';

const eventSchema = z.object({
  name: z.string().min(2, 'En az 2 karakter olmalı'),
  description: z.string().optional(),
  location: z.string().optional(),
  eventTypeId: z.string().min(1, 'Etkinlik tipi seçiniz'),
  formUrl: z.string().url().optional().or(z.literal('')),
  startDate: z.string(),
  endDate: z.string().min(1, 'Bitiş tarihi zorunludur'),
  linkedin: z.string().url().optional().or(z.literal('')),
  active: z.boolean().optional(),
  competitionId: z.string().optional(),
  coverImage: z.custom<File>((val) => val instanceof File, 'Kapak resmi zorunludur'),
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
  const [currentUser, setCurrentUser] = useState<UserDto | null>(null);
  const [leaderEventTypeId, setLeaderEventTypeId] = useState<string | null>(null);

  const loadEventTypes = () => {
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
  };

  const checkLeaderRole = (user: UserDto, types: { value: string; label: string }[]) => {
    const leaderTypeName = getLeaderEventType(user);
    if (leaderTypeName) {
      const matchedType = types.find((t) => t.label === leaderTypeName);
      if (matchedType) {
        setLeaderEventTypeId(matchedType.value);
        if (eventFormMethodsRef.current) {
          eventFormMethodsRef.current.setValue('eventTypeId', matchedType.value);
        }
      }
    }
  };

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
        }
      })
      .catch((err) => console.error('User fetch error:', err));

    loadEventTypes();
  }, []);

  useEffect(() => {
    if (currentUser && eventTypes.length > 0) {
      checkLeaderRole(currentUser, eventTypes);
    }
  }, [currentUser, eventTypes]);

  const handleSubmit = async (data: z.infer<typeof eventSchema>) => {
    startTransition(async () => {
      try {
        const coverImage = data.coverImage;
        const eventData = {
          name: data.name,
          description: data.description || undefined,
          location: data.location ?? '',
          eventTypeId: data.eventTypeId,
          formUrl: coverImage ? data.formUrl || undefined : undefined,
          startDate: convertGMT3ToGMT0(data.startDate),
          endDate: convertGMT3ToGMT0(data.endDate),
          linkedin: data.linkedin || undefined,
          active: true,
          competitionId: data.competitionId || undefined,
        };
        await eventsApi.create(eventData, coverImage);

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
        authorizedRoles: [data.name, `${data.name}_LEADER`],
      });
      if (response.success && response.data) {
        loadEventTypes();
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
      <PageHeader title="Yeni Etkinlik" description="Sisteme yeni etkinlik ekleyin" />

      <div className="mx-auto max-w-3xl">
        <div className="bg-light border-dark-200 rounded-lg border p-4 shadow">
          <Form
            schema={eventSchema}
            onSubmit={handleSubmit}
            defaultValues={{
              coverImage: undefined,
              eventTypeId: leaderEventTypeId || '',
              startDate: getCurrentDateTimeGMT3(),
              endDate: getCurrentDateTimeGMT3(),
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
                          {!leaderEventTypeId && (
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
                        <TextField
                          name="formUrl"
                          label="Form URL"
                          type="url"
                          placeholder="https://forms.google.com/..."
                        />
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
                      <h3 className="text-dark-800 mb-3 text-sm font-semibold">Ek Bilgiler</h3>
                      <div className="space-y-4">
                        <TextField
                          name="linkedin"
                          label="LinkedIn URL"
                          type="url"
                          placeholder="https://www.linkedin.com/events/..."
                        />
                        <FileUpload name="coverImage" label="Kapak Resmi" accept="image/*" />
                      </div>
                    </div>
                  </div>
                  <div className="border-dark-200 mt-6 flex items-center justify-between gap-3 border-t pt-5">
                    <Button
                      href="/events"
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Yeni Etkinlik Tipi">
        <Form schema={eventTypeSchema} onSubmit={(data) => handleCreateEventType(data)}>
          {(methods) => (
            <>
              <div className="space-y-4">
                <TextField name="name" label="Ad" required placeholder="Workshop, Seminer, vb." />
              </div>
              <div className="border-dark-200 mt-6 flex items-center justify-between gap-3 border-t pt-5">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsModalOpen(false)}
                  className="border-red-500 bg-transparent text-red-500 hover:bg-red-500 hover:text-white"
                >
                  İptal
                </Button>
                <Button
                  type="submit"
                  disabled={isCreatingEventType}
                  className="!text-brand hover:!bg-brand border-brand !bg-transparent hover:!text-white"
                >
                  {isCreatingEventType ? 'Kaydediliyor...' : 'Kaydet'}
                </Button>
              </div>
            </>
          )}
        </Form>
      </Modal>
    </div>
  );
}
