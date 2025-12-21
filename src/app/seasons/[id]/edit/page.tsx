'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

import { PageHeader } from '@/components/layout/PageHeader';
import { Form } from '@/components/forms/Form';
import { TextField } from '@/components/forms/TextField';
import { DatePicker } from '@/components/forms/DatePicker';
import { Button } from '@/components/ui/Button';
import { Toggle } from '@/components/ui/Toggle';
import { z } from 'zod';
import { seasonsApi } from '@/lib/api/seasons';
import { eventsApi } from '@/lib/api/events';
import type { SeasonDto, EventDto } from '@/types/api';
import { formatGMT0ToLocalInput, convertGMT3ToGMT0 } from '@/lib/utils/date';

import { Modal } from '@/components/ui/Modal';
import { HiOutlineTrash } from 'react-icons/hi2';

const seasonSchema = z.object({
  name: z.string().min(2, 'En az 2 karakter olmalı'),
  startDate: z.string(),
  endDate: z.string(),
  active: z.boolean().optional(),
});

export default function EditSeasonPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [isPending, startTransition] = useTransition();
  const [season, setSeason] = useState<SeasonDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  // State defined above
  // New state for events
  const [availableEvents, setAvailableEvents] = useState<EventDto[]>([]);
  const [selectedEventId, setSelectedEventId] = useState('');

  useEffect(() => {
    eventsApi.getAll().then((res) => {
      if (res.success && res.data) setAvailableEvents(res.data);
    });
  }, []);

  useEffect(() => {
    if (id) {
      seasonsApi
        .getById(id, { includeEvents: true }) // Include events initially too
        .then((response) => {
          if (response.success && response.data) {
            setSeason(response.data);
            setIsActive(response.data.active ?? true);
          } else {
            setError('Sezon bulunamadı');
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error('Season fetch error:', err);
          setError('Sezon yüklenirken hata oluştu');
          setLoading(false);
        });
    }
  }, [id]);

  const handleSubmit = async (data: z.infer<typeof seasonSchema>) => {
    startTransition(async () => {
      try {
        await seasonsApi.update(id, {
          name: data.name,
          startDate: convertGMT3ToGMT0(data.startDate),
          endDate: convertGMT3ToGMT0(data.endDate),
          active: isActive,
        });
        router.push('/seasons');
      } catch (error) {
        console.error('Season update error:', error);
      }
    });
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await seasonsApi.delete(id);
      if (response.success) {
        router.push('/seasons');
      } else {
        console.error('Delete failed:', response);
      }
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleAddEvent = async () => {
    if (!selectedEventId) return;
    try {
      await seasonsApi.addEvent(id, selectedEventId);
      // Reload season
      const response = await seasonsApi.getById(id, { includeEvents: true });
      if (response.success && response.data) {
        setSeason(response.data);
      }
      setSelectedEventId('');
    } catch (e) {
      console.error(e);
      alert('Etkinlik eklenirken hata oluştu');
    }
  };

  const handleRemoveEvent = async (eventId: string) => {
    if (!confirm('Bu etkinliği sezondan çıkarmak istediğinize emin misiniz?')) return;
    try {
      await seasonsApi.removeEvent(id, eventId);
      // Reload season
      const response = await seasonsApi.getById(id, { includeEvents: true });
      if (response.success && response.data) {
        setSeason(response.data);
      }
    } catch (e) {
      console.error(e);
      alert('Etkinlik çıkarılırken hata oluştu');
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="py-8 text-center">Yükleniyor...</div>
      </div>
    );
  }

  if (error || !season) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <h2 className="mb-2 text-lg font-semibold text-red-800">Hata</h2>
          <p className="text-red-700">{error || 'Sezon bulunamadı'}</p>
          <Button href="/seasons" variant="secondary" className="mt-4">
            Geri Dön
          </Button>
        </div>
      </div>
    );
  }

  // Filter events that are not already in the season
  const eventsToAdd = availableEvents.filter((e) => !season.events?.some((se) => se.id === e.id));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sezon Düzenle"
        description={season.name}
        actions={
          <div className="flex items-center gap-3">
            <Toggle checked={isActive} onChange={setIsActive} />
            <Button
              type="button"
              variant="danger"
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center justify-center !border-0 !bg-transparent !px-3 !py-3 hover:!bg-transparent"
              aria-label="Sezonu sil"
            >
              <HiOutlineTrash className="text-danger h-5 w-5" />
            </Button>
          </div>
        }
      />

      <div className="mx-auto max-w-3xl space-y-6">
        <div className="bg-light border-dark-200 rounded-lg border p-4 shadow">
          <Form
            schema={seasonSchema}
            onSubmit={handleSubmit}
            defaultValues={{
              name: season.name,
              startDate: season.startDate ? formatGMT0ToLocalInput(season.startDate) : '',
              endDate: season.endDate ? formatGMT0ToLocalInput(season.endDate) : '',
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
                        <TextField name="name" label="Ad" required placeholder="2024-2025" />
                        <DatePicker name="startDate" label="Başlangıç Tarihi" required />
                        <DatePicker name="endDate" label="Bitiş Tarihi" required />
                      </div>
                    </div>
                  </div>
                  <div className="border-dark-200 mt-6 flex items-center justify-between gap-3 border-t pt-5">
                    <Button
                      href="/seasons"
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

        {/* Season Events Section */}
        <div className="bg-light border-dark-200 rounded-lg border p-4 shadow">
          <h3 className="text-dark-800 mb-4 text-base font-semibold">Sezon Etkinlikleri</h3>

          {/* List Events */}
          <div className="mb-6 space-y-2">
            {season.events && season.events.length > 0 ? (
              season.events.map((event) => (
                <div
                  key={event.id}
                  className="border-dark-100 bg-light-50 flex items-center justify-between rounded-md border p-3"
                >
                  <div>
                    <div className="text-dark-900 font-medium">{event.name}</div>
                    <div className="text-dark-500 text-xs">
                      {new Date(event.startDate || '').toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveEvent(event.id)}
                    className="text-sm font-medium text-red-500 hover:text-red-700"
                  >
                    Çıkar
                  </button>
                </div>
              ))
            ) : (
              <p className="text-dark-500 text-sm italic">
                Bu sezona ait etkinlik bulunmamaktadır.
              </p>
            )}
          </div>

          {/* Add Event Form */}
          <div className="border-dark-100 border-t pt-4">
            <label className="text-dark-800 mb-2 block text-sm font-medium">Etkinlik Ekle</label>
            <div className="flex gap-2">
              <select
                className="bg-light border-dark-200 focus:ring-brand text-dark flex-1 rounded-md border px-3 py-2 focus:ring-2 focus:outline-none"
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
              >
                <option value="">Eklemek için etkinlik seçiniz...</option>
                {eventsToAdd.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
              <Button onClick={handleAddEvent} disabled={!selectedEventId}>
                Ekle
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Sezonu Sil">
        <p>
          <strong>{season.name}</strong> sezonunu silmek istediğinizden emin misiniz? Bu işlem geri
          alınamaz.
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
