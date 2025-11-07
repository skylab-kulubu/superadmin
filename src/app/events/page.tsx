'use client';

import { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
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
      <div className="space-y-6">
        <PageHeader
          title="Etkinlikler"
          description="Tüm etkinlikleri görüntüleyin ve yönetin"
          actions={(
            <Link href="/events/new">
              <Button>
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Yeni Etkinlik
                </span>
              </Button>
            </Link>
          )}
        />

        {/* Error State */}
        {error ? (
          <div className="bg-light border-l-4 border-danger rounded-xl shadow-lg p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-danger-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-danger-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-danger-800 mb-2">Hata Oluştu</h2>
                <p className="text-dark-700">{error}</p>
              </div>
            </div>
          </div>
        ) : events.length === 0 ? (
          /* Empty State */
          <div className="bg-light border border-dark-200/50 rounded-xl shadow-lg p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 rounded-full bg-brand-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-dark-800 mb-2">Henüz etkinlik yok</h3>
              <p className="text-dark-600 mb-6">Sisteme ilk etkinliği ekleyerek başlayın</p>
              <Link href="/events/new">
                <Button>
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    İlk Etkinliği Ekle
                  </span>
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          /* Events Table */
          <div className="bg-light rounded-xl shadow-lg border border-dark-200/50 p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-dark-600">Toplam Etkinlik</p>
                  <p className="text-2xl font-bold text-brand">{events.length}</p>
                </div>
              </div>
            </div>
            <DataTable
              data={formattedEvents}
              columns={[
                { key: 'name', header: 'Ad' },
                { key: 'locationText', header: 'Konum' },
                { key: 'startDateFormatted', header: 'Başlangıç' },
                { key: 'eventTypeName', header: 'Tip' },
                { 
                  key: 'statusText', 
                  header: 'Durum',
                  render: (value) => (
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                      value === 'Aktif' 
                        ? 'bg-brand-100 text-brand-700 border border-brand-200/50' 
                        : 'bg-dark-100 text-dark-700 border border-dark-200/50'
                    }`}>
                      {value}
                    </span>
                  ),
                },
                {
                  key: 'coverImageUrl',
                  header: 'Kapak',
                  render: (value) => value ? (
                    <img src={String(value)} alt="Kapak" className="h-12 w-20 object-cover rounded-lg shadow-sm border border-dark-200/50" />
                  ) : (
                    <span className="text-dark-400 text-xs">Kapak yok</span>
                  ),
                },
              ]}
              onEdit={handleEdit}
              onDelete={handleDelete}
              idKey="id"
            />
          </div>
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
