'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/tables/DataTable';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import Link from 'next/link';
import { eventTypesApi } from '@/lib/api/event-types';
import type { EventTypeDto } from '@/types/api';

export default function EventTypesPage() {
  const router = useRouter();
  const [eventTypes, setEventTypes] = useState<EventTypeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedEventType, setSelectedEventType] = useState<EventTypeDto | null>(null);

  const loadEventTypes = () => {
    setLoading(true);
    eventTypesApi.getAll().then((response) => {
      if (response.success && response.data) {
        setEventTypes(response.data);
      } else {
        setError('Etkinlik tipleri yüklenirken hata oluştu');
      }
      setLoading(false);
    }).catch((err) => {
      console.error('Event types fetch error:', err);
      setError(err instanceof Error ? err.message : 'Etkinlik tipleri yüklenirken hata oluştu');
      setLoading(false);
    });
  };

  useEffect(() => {
    loadEventTypes();
  }, []);

  const handleEdit = (eventType: EventTypeDto) => {
    router.push(`/event-types/${eventType.id}/edit`);
  };

  const handleDeleteClick = (eventType: EventTypeDto) => {
    setSelectedEventType(eventType);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!selectedEventType) return;

    startTransition(async () => {
      try {
        await eventTypesApi.delete(selectedEventType.id);
        setDeleteModalOpen(false);
        setSelectedEventType(null);
        loadEventTypes();
      } catch (error) {
        console.error('Event type delete error:', error);
        alert('Etkinlik tipi silinirken hata oluştu: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
      }
    });
  };

  if (loading) {
    return (
      <AppShell>
        <div className="text-center py-8">Yükleniyor...</div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="Etkinlik Tipleri"
          description="Etkinlik tiplerini görüntüleyin ve yönetin"
          actions={(
            <Link href="/event-types/new">
              <Button>
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Yeni Etkinlik Tipi
                </span>
              </Button>
            </Link>
          )}
        />

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Hata</h2>
            <p className="text-red-700">{error}</p>
          </div>
        ) : eventTypes.length === 0 ? (
          <div className="bg-light border border-dark-200 rounded-lg p-6 text-center">
            <p className="text-dark opacity-60">Henüz etkinlik tipi bulunmamaktadır.</p>
          </div>
        ) : (
          <DataTable
            data={eventTypes}
            columns={[
              { key: 'name', header: 'Ad' },
            ]}
            idKey="id"
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
          />
        )}

        <Modal
          isOpen={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setSelectedEventType(null);
          }}
          title="Etkinlik Tipi Sil"
        >
          <div className="space-y-4">
            <p>
              <strong>{selectedEventType?.name}</strong> adlı etkinlik tipini silmek istediğinize emin misiniz?
            </p>
            <p className="text-sm text-dark opacity-60">
              Bu işlem geri alınamaz.
            </p>
            <div className="flex gap-4 mt-6">
              <Button
                type="button"
                variant="danger"
                onClick={handleDeleteConfirm}
                disabled={isPending}
              >
                {isPending ? 'Siliniyor...' : 'Sil'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setSelectedEventType(null);
                }}
              >
                İptal
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </AppShell>
  );
}
