'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ModalDangerActions } from '@/components/ui/modal-actions';
import { eventsApi } from '@/lib/api/events';
import { eventDaysApi } from '@/lib/api/eventDays';
import { useAuth } from '@/context/AuthContext';
import {
  canOperateEventScheduling,
  canOperateEventSchedulingOnEvent,
} from '@/lib/utils/permissions';
import {
  convertGMT3ToGMT0,
  formatGMT0ToLocalInput,
  getCurrentDateTimeGMT3,
} from '@/lib/utils/date';
import type { EventDto } from '@/types/api';

type EditableDay = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isSaving?: boolean;
  isDeleting?: boolean;
};

function sortByStartDate(a: EditableDay, b: EditableDay) {
  return new Date(a.startDate || 0).getTime() - new Date(b.startDate || 0).getTime();
}

function isInvalidDate(value: string) {
  return Number.isNaN(new Date(value).getTime());
}

export default function EventDaysManagementPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = typeof params?.id === 'string' ? params.id : '';
  const { user, loading: authLoading } = useAuth();

  const [event, setEvent] = useState<EventDto | null>(null);
  const [days, setDays] = useState<EditableDay[]>([]);
  const [newDay, setNewDay] = useState({
    name: '',
    startDate: getCurrentDateTimeGMT3(),
    endDate: getCurrentDateTimeGMT3(),
  });
  const [loadState, setLoadState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isCreatingDay, setIsCreatingDay] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<EditableDay | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!canOperateEventScheduling(user ?? null)) {
      router.replace(eventId ? `/events/${eventId}` : '/events');
    }
  }, [authLoading, user, router, eventId]);

  useEffect(() => {
    if (!eventId) {
      setLoadState('idle');
      return;
    }

    let cancelled = false;
    setLoadState('loading');
    setLoadError(null);

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
          setLoadState('error');
          setLoadError('Etkinlik bulunamadı.');
          return;
        }

        const mappedDays = (daysRes.success && daysRes.data ? daysRes.data : [])
          .map((day, index) => ({
            id: day.id,
            name: day.name?.trim() || `${index + 1}. Gün`,
            startDate: day.startDate ? formatGMT0ToLocalInput(day.startDate) : '',
            endDate: day.endDate ? formatGMT0ToLocalInput(day.endDate) : '',
          }))
          .sort(sortByStartDate);

        setDays(mappedDays);
        setLoadState('ready');
      } catch (error) {
        console.error('Event days load error:', error);
        if (!cancelled) {
          setLoadState('error');
          setLoadError('Etkinlik günleri yüklenirken hata oluştu.');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [eventId]);

  useEffect(() => {
    if (authLoading || !event || !canOperateEventScheduling(user ?? null)) return;
    if (!canOperateEventSchedulingOnEvent(user ?? null, event.type?.name)) {
      router.replace(`/events/${eventId}`);
    }
  }, [authLoading, user, event, eventId, router]);

  const validateDayInput = (name: string, startDate: string, endDate: string) => {
    if (!name.trim() || !startDate || !endDate) {
      return 'Gün adı, başlangıç ve bitiş tarihi zorunludur.';
    }
    if (isInvalidDate(startDate) || isInvalidDate(endDate)) {
      return 'Geçerli bir tarih seçin.';
    }
    if (new Date(startDate).getTime() > new Date(endDate).getTime()) {
      return 'Bitiş tarihi başlangıçtan önce olamaz.';
    }
    return null;
  };

  const handleCreateDay = async () => {
    if (!eventId) return;
    const validationError = validateDayInput(newDay.name, newDay.startDate, newDay.endDate);
    if (validationError) {
      alert(validationError);
      return;
    }

    setIsCreatingDay(true);
    try {
      const res = await eventDaysApi.create({
        eventId,
        name: newDay.name.trim(),
        startDate: convertGMT3ToGMT0(newDay.startDate),
        endDate: convertGMT3ToGMT0(newDay.endDate),
      });

      if (!res.success || !res.data?.id) {
        throw new Error(res.message || 'Gün eklenemedi.');
      }

      const created: EditableDay = {
        id: res.data.id,
        name: res.data.name?.trim() || newDay.name.trim(),
        startDate: res.data.startDate
          ? formatGMT0ToLocalInput(res.data.startDate)
          : newDay.startDate,
        endDate: res.data.endDate ? formatGMT0ToLocalInput(res.data.endDate) : newDay.endDate,
      };

      setDays((prev) => [...prev, created].sort(sortByStartDate));
      setNewDay({
        name: `${days.length + 2}. Gün`,
        startDate: getCurrentDateTimeGMT3(),
        endDate: getCurrentDateTimeGMT3(),
      });
    } catch (error) {
      alert(
        'Gün eklenirken hata oluştu: ' +
          (error instanceof Error ? error.message : 'Bilinmeyen hata'),
      );
    } finally {
      setIsCreatingDay(false);
    }
  };

  const handleDayFieldChange = (
    id: string,
    field: 'name' | 'startDate' | 'endDate',
    value: string,
  ) => {
    setDays((prev) => prev.map((day) => (day.id === id ? { ...day, [field]: value } : day)));
  };

  const handleSaveDay = async (dayId: string) => {
    const day = days.find((d) => d.id === dayId);
    if (!day) return;

    const validationError = validateDayInput(day.name, day.startDate, day.endDate);
    if (validationError) {
      alert(validationError);
      return;
    }

    setDays((prev) => prev.map((d) => (d.id === dayId ? { ...d, isSaving: true } : d)));
    try {
      const res = await eventDaysApi.update(dayId, {
        startDate: convertGMT3ToGMT0(day.startDate),
        endDate: convertGMT3ToGMT0(day.endDate),
      });

      if (!res.success) {
        throw new Error(res.message || 'Gün güncellenemedi.');
      }

      // API güncelleme isteğinde isim yok; isim alanı burada yalnızca görsel amaçlı tutuluyor.
      setDays((prev) =>
        prev
          .map((d) =>
            d.id === dayId
              ? {
                  ...d,
                  isSaving: false,
                  startDate: res.data?.startDate
                    ? formatGMT0ToLocalInput(res.data.startDate)
                    : d.startDate,
                  endDate: res.data?.endDate ? formatGMT0ToLocalInput(res.data.endDate) : d.endDate,
                }
              : d,
          )
          .sort(sortByStartDate),
      );
    } catch (error) {
      setDays((prev) => prev.map((d) => (d.id === dayId ? { ...d, isSaving: false } : d)));
      alert(
        'Gün güncellenirken hata oluştu: ' +
          (error instanceof Error ? error.message : 'Bilinmeyen hata'),
      );
    }
  };

  const handleDeleteDay = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget.id;

    setDays((prev) => prev.map((d) => (d.id === id ? { ...d, isDeleting: true } : d)));
    try {
      const res = await eventDaysApi.delete(id);
      if (!res.success) {
        throw new Error(res.message || 'Gün silinemedi.');
      }
      setDays((prev) => prev.filter((d) => d.id !== id));
      setDeleteTarget(null);
    } catch (error) {
      setDays((prev) => prev.map((d) => (d.id === id ? { ...d, isDeleting: false } : d)));
      alert(
        'Gün silinirken hata oluştu: ' +
          (error instanceof Error ? error.message : 'Bilinmeyen hata'),
      );
    }
  };

  const deletingTarget = deleteTarget ? days.find((d) => d.id === deleteTarget.id) : null;

  if (!eventId) {
    return (
      <div className="space-y-6">
        <PageHeader title="Etkinlik Günleri" />
        <div className="text-dark-500 mx-auto max-w-3xl py-8 text-center text-sm">
          <p>Etkinlik bilgisi bulunamadı.</p>
          <Button href="/events" variant="secondary" className="mt-4">
            Etkinliklere Dön
          </Button>
        </div>
      </div>
    );
  }

  if (loadState === 'loading') {
    return (
      <div className="space-y-6">
        <PageHeader title="Etkinlik Günleri" description={event?.name} />
        <div className="text-dark-500 mx-auto max-w-3xl py-8 text-center text-sm">Yükleniyor…</div>
      </div>
    );
  }

  if (loadState === 'error' || !event) {
    return (
      <div className="space-y-6">
        <PageHeader title="Etkinlik Günleri" />
        <div className="mx-auto max-w-3xl rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {loadError || 'Etkinlik yüklenemedi.'}
        </div>
        <div className="mx-auto max-w-3xl text-center">
          <Button href={`/events/${eventId}`} variant="secondary">
            Etkinliğe Dön
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Etkinlik Günleri"
        description={event.name}
        actions={
          <Button href={`/events/${eventId}`} variant="secondary">
            Etkinliğe Dön
          </Button>
        }
      />

      <div className="mx-auto max-w-4xl space-y-6">
        <div className="bg-light border-dark-200 rounded-lg border p-4 shadow">
          <h3 className="text-dark-800 mb-3 text-sm font-semibold">Yeni Gün Ekle</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="text-dark mb-1 block text-sm font-medium">Gün Adı</label>
              <input
                type="text"
                value={newDay.name}
                onChange={(e) => setNewDay((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="1. Gün"
                className="text-dark placeholder:text-dark border-dark-200 bg-light focus:ring-brand w-full rounded-md border px-3 py-2 text-sm placeholder:opacity-60 focus:border-transparent focus:ring-2 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-dark mb-1 block text-sm font-medium">Başlangıç</label>
              <input
                type="datetime-local"
                value={newDay.startDate}
                onChange={(e) => setNewDay((prev) => ({ ...prev, startDate: e.target.value }))}
                className="text-dark border-dark-200 bg-light focus:ring-brand w-full rounded-md border px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-dark mb-1 block text-sm font-medium">Bitiş</label>
              <input
                type="datetime-local"
                value={newDay.endDate}
                onChange={(e) => setNewDay((prev) => ({ ...prev, endDate: e.target.value }))}
                className="text-dark border-dark-200 bg-light focus:ring-brand w-full rounded-md border px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:outline-none"
              />
            </div>
          </div>
          <div className="border-dark-200 mt-4 flex justify-end border-t pt-4">
            <Button
              type="button"
              variant="outlineBrand"
              onClick={handleCreateDay}
              disabled={isCreatingDay}
            >
              {isCreatingDay ? 'Ekleniyor...' : 'Gün Ekle'}
            </Button>
          </div>
        </div>

        <div className="bg-light border-dark-200 rounded-lg border p-4 shadow">
          <h3 className="text-dark-800 mb-3 text-sm font-semibold">
            Mevcut Günler ({days.length})
          </h3>
          {days.length === 0 ? (
            <p className="text-dark-500 py-4 text-sm">Bu etkinlik için henüz gün tanımlı değil.</p>
          ) : (
            <div className="space-y-3">
              {days.map((day) => (
                <div key={day.id} className="border-dark-200 bg-dark-50 rounded-md border p-3">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div>
                      <label className="text-dark mb-1 block text-sm font-medium">Gün Adı</label>
                      <input
                        type="text"
                        value={day.name}
                        readOnly
                        className="text-dark border-dark-200 bg-light focus:ring-brand w-full rounded-md border px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-dark mb-1 block text-sm font-medium">Başlangıç</label>
                      <input
                        type="datetime-local"
                        value={day.startDate}
                        onChange={(e) => handleDayFieldChange(day.id, 'startDate', e.target.value)}
                        className="text-dark border-dark-200 bg-light focus:ring-brand w-full rounded-md border px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-dark mb-1 block text-sm font-medium">Bitiş</label>
                      <input
                        type="datetime-local"
                        value={day.endDate}
                        onChange={(e) => handleDayFieldChange(day.id, 'endDate', e.target.value)}
                        className="text-dark border-dark-200 bg-light focus:ring-brand w-full rounded-md border px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outlineDanger"
                      onClick={() => setDeleteTarget(day)}
                      disabled={day.isSaving || day.isDeleting}
                    >
                      {day.isDeleting ? 'Siliniyor...' : 'Sil'}
                    </Button>
                    <Button
                      type="button"
                      variant="outlineBrand"
                      onClick={() => handleSaveDay(day.id)}
                      disabled={day.isSaving || day.isDeleting}
                    >
                      {day.isSaving ? 'Kaydediliyor...' : 'Kaydet'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <p className="text-dark-500 mt-3 text-xs">
            Not: API güncellemede yalnız başlangıç ve bitiş tarihini alır. Gün adı değişikliği için
            günü silip yeniden ekleyin.
          </p>
        </div>
      </div>

      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Günü sil">
        <p className="text-dark-700 text-sm">
          <strong>{deleteTarget?.name || 'Bu günü'}</strong> silmek istediğinize emin misiniz?
        </p>
        <ModalDangerActions
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDeleteDay}
          isPending={!!deletingTarget?.isDeleting}
          pendingLabel="Siliniyor..."
        />
      </Modal>
    </div>
  );
}
