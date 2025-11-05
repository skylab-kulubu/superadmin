'use client';

import { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { DataTable } from '@/components/tables/DataTable';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { EventDto } from '@/types/api';
import { eventsApi } from '@/lib/api/events';

export default function EventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<EventDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const loadEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await eventsApi.getAll({ includeEventType: true });
      if (response.success && response.data) {
        setEvents(response.data);
      } else {
        setError(response.message || 'Etkinlikler yüklenirken hata oluştu');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Etkinlikler yüklenirken hata oluştu');
      console.error('Events page fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleEdit = (event: EventDto) => {
    router.push(`/events/${event.id}/edit`);
  };

  const handleDelete = (event: EventDto) => {
    setSelectedEventId(event.id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (selectedEventId) {
      try {
        await eventsApi.delete(selectedEventId);
        loadEvents();
        setShowDeleteModal(false);
        setSelectedEventId(null);
      } catch (err) {
        alert('Silme işlemi başarısız oldu: ' + (err instanceof Error ? err.message : 'Bilinmeyen hata'));
        console.error('Delete event error:', err);
      }
    }
  };

  // Format data for display
  const formattedEvents = events.map(event => ({
    ...event,
    startDateFormatted: event.startDate ? new Date(event.startDate).toLocaleDateString('tr-TR') : '',
    eventTypeName: event.type?.name || '-',
    statusText: event.active ? 'Aktif' : 'Pasif',
    locationText: event.location || '-',
  }));

  if (loading) {
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Etkinlikler</h1>
          <p>Yükleniyor...</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Etkinlikler</h1>
          <Link href="/events/new">
            <Button>Yeni Etkinlik</Button>
          </Link>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Hata</h2>
            <p className="text-red-700">{error}</p>
          </div>
        ) : events.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
            <p className="text-gray-600">Henüz etkinlik bulunmamaktadır.</p>
          </div>
        ) : (
          <DataTable
            data={formattedEvents}
            columns={[
              { key: 'name', header: 'Ad' },
              { key: 'locationText', header: 'Konum' },
              { key: 'startDateFormatted', header: 'Başlangıç' },
              { key: 'eventTypeName', header: 'Tip' },
              { key: 'statusText', header: 'Durum' },
              {
                key: 'coverImageUrl',
                header: 'Kapak',
                render: (value) => value ? (
                  <img src={String(value)} alt="Kapak" className="h-10 w-16 object-cover rounded" />
                ) : '-',
              },
            ]}
            onEdit={handleEdit}
            onDelete={handleDelete}
            idKey="id"
          />
        )}
      </div>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Etkinliği Sil"
      >
        <p>Bu etkinliği silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.</p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="danger" onClick={confirmDelete}>Sil</Button>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>İptal</Button>
        </div>
      </Modal>
    </AppShell>
  );
}
