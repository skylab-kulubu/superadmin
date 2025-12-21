'use client';

import { useState, useTransition, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { HiOutlineTrash } from 'react-icons/hi2';

import { PageHeader } from '@/components/layout/PageHeader';
import { Form } from '@/components/forms/Form';
import { TextField } from '@/components/forms/TextField';
import { Textarea } from '@/components/forms/Textarea';
import { DatePicker } from '@/components/forms/DatePicker';
import { Select } from '@/components/forms/Select';
import { FileUpload } from '@/components/forms/FileUpload';
import { Button } from '@/components/ui/Button';
import { Toggle } from '@/components/ui/Toggle';
import { Modal } from '@/components/ui/Modal';
import { z } from 'zod';
import { eventsApi } from '@/lib/api/events';
import { eventTypesApi } from '@/lib/api/event-types';
import type { EventDto, UserDto } from '@/types/api';
import { formatGMT0ToLocalInput, convertGMT3ToGMT0 } from '@/lib/utils/date';
import { getLeaderEventType } from '@/lib/utils/permissions';

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
  coverImage: z
    .custom<File | undefined>((val) => val === undefined || val instanceof File)
    .optional(),
});

export default function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [isPending, startTransition] = useTransition();
  const [event, setEvent] = useState<EventDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eventTypes, setEventTypes] = useState<{ value: string; label: string }[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
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

    if (id) {
      Promise.all([eventsApi.getById(id, { includeEventType: true }), eventTypesApi.getAll()])
        .then(([eventResponse, eventTypesResponse]) => {
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
        })
        .catch((err) => {
          console.error('Event fetch error:', err);
          setError('Etkinlik yüklenirken hata oluştu');
          setLoading(false);
        });
    }
  }, [id]);

  const handleSubmit = async (data: z.infer<typeof eventSchema>) => {
    // Permission check
    if (currentUser) {
      const leaderType = getLeaderEventType(currentUser);
      if (leaderType) {
        // Check if the event type matches the leader's type
        const selectedType = eventTypes.find((t) => t.value === data.eventTypeId);
        if (selectedType && selectedType.label !== leaderType) {
          alert('Bu etkinlik tipini düzenleme yetkiniz yok.');
          return;
        }
      }
    }

    startTransition(async () => {
      try {
        // Note: Backend currently does not support updating cover image via PUT /api/events/{id}
        // So we ignore data.coverImage for now or implement a separate image upload flow if backend supports it later.

        const eventData = {
          name: data.name,
          description: data.description || undefined,
          location: data.location || undefined,
          // typeId maps to 'type' or 'typeId' in request? Schema has both 'type' (string) and 'typeId' (uuid).
          // Use typeId for uuid.
          typeId: data.eventTypeId,
          formUrl: data.formUrl || undefined,
          startDate: convertGMT3ToGMT0(data.startDate),
          endDate: data.endDate ? convertGMT3ToGMT0(data.endDate) : undefined,
          linkedin: data.linkedin || undefined,
          active: isActive,
          competitionId: data.competitionId || undefined,
        };

        await eventsApi.update(id, eventData);

        router.push('/events');
      } catch (error) {
        console.error('Event update error:', error);
        alert(
          'Etkinlik güncellenirken hata oluştu: ' +
            (error instanceof Error ? error.message : 'Bilinmeyen hata'),
        );
      }
    });
  };

  const handleDelete = async () => {
    if (!event) return;
    setIsDeleting(true);
    try {
      await eventsApi.delete(event.id);
      router.push('/events');
    } catch (err) {
      console.error('Event delete error:', err);
      alert(
        'Etkinlik silinirken hata oluştu: ' +
          (err instanceof Error ? err.message : 'Bilinmeyen hata'),
      );
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="py-8 text-center">Yükleniyor...</div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <h2 className="mb-2 text-lg font-semibold text-red-800">Hata</h2>
          <p className="text-red-700">{error || 'Etkinlik bulunamadı'}</p>
          <Button href="/events" variant="secondary" className="mt-4">
            Geri Dön
          </Button>
        </div>
      </div>
    );
  }

  const isLeader = !!currentUser && !!getLeaderEventType(currentUser);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Etkinlik Düzenle"
        description={event.name}
        actions={
          <div className="flex items-center gap-3">
            <Toggle checked={isActive} onChange={setIsActive} />
            <Button
              type="button"
              variant="danger"
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center justify-center !border-0 !bg-transparent !px-3 !py-3 hover:!bg-transparent"
              aria-label="Etkinliği sil"
            >
              <HiOutlineTrash className="text-danger h-5 w-5" />
            </Button>
          </div>
        }
      />

      <div className="mx-auto max-w-3xl">
        <div className="bg-light border-dark-200 rounded-lg border p-4 shadow">
          <Form
            schema={eventSchema}
            onSubmit={handleSubmit}
            defaultValues={{
              name: event.name,
              description: event.description || '',
              location: event.location || '',
              eventTypeId: event.type?.id || '',
              formUrl: event.formUrl || '',
              startDate: event.startDate ? formatGMT0ToLocalInput(event.startDate) : '',
              endDate: event.endDate ? formatGMT0ToLocalInput(event.endDate) : '',
              linkedin: event.linkedin || '',
              // competitionId not present in EventDto according to backend spec
              competitionId: '',
              coverImage: undefined,
            }}
          >
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
                        <TextField
                          name="name"
                          label="Ad"
                          required
                          placeholder="Yazılım Geliştirme Workshop'u"
                        />
                        <Select
                          name="eventTypeId"
                          label="Etkinlik Tipi"
                          options={eventTypes}
                          required
                          disabled={isLeader}
                        />
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
                        <DatePicker name="endDate" label="Bitiş Tarihi" />
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
                        {event.coverImageUrl && (
                          <div>
                            <label className="text-dark mb-1 block text-sm font-medium">
                              Mevcut Kapak
                            </label>
                            <img
                              src={event.coverImageUrl}
                              alt="Mevcut Kapak"
                              className="h-24 w-40 rounded border object-cover"
                            />
                          </div>
                        )}
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
                      {isPending ? 'Güncelleniyor...' : 'Güncelle'}
                    </Button>
                  </div>
                </>
              );
            }}
          </Form>
        </div>
      </div>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Etkinliği Sil"
      >
        <p>
          <strong>{event.name}</strong> etkinliğini silmek istediğinizden emin misiniz? Bu işlem
          geri alınamaz.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="danger" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? 'Siliniyor...' : 'Sil'}
          </Button>
          <Button
            variant="secondary"
            onClick={() => setShowDeleteModal(false)}
            disabled={isDeleting}
          >
            İptal
          </Button>
        </div>
      </Modal>
    </div>
  );
}
