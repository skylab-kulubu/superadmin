'use client';

// =====================================================
// BU SAYFA BAKIM AŞAMASINDA - EKSİK ENDPOINT
// Sebep: GET /api/sessions/{id} endpoint'i backend'de yok
// =====================================================

import { PageHeader } from '@/components/layout/PageHeader';

export default function SessionsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Oturumlar" description="Oturumları görüntüleyin ve yönetin" />

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

import { useState, useEffect } from 'react';

import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/tables/DataTable';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { SessionDto } from '@/types/api';
import { sessionsApi } from '@/lib/api/sessions';

export default function SessionsPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  const loadSessions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await sessionsApi.getAll({ includeEvent: true });
      if (response.success && response.data) {
        setSessions(response.data);
      } else {
        setError(response.message || 'Oturumlar yüklenirken hata oluştu');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Oturumlar yüklenirken hata oluştu');
      setError(err instanceof Error ? err.message : 'Oturumlar yüklenirken hata oluştu');
      console.error('Sessions page fetch error details:', {
        error: err,
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleEdit = (session: SessionDto) => {
    router.push(`/sessions/${session.id}/edit`);
  };

  const handleDelete = (session: SessionDto) => {
    setSelectedSessionId(session.id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (selectedSessionId) {
      try {
        await sessionsApi.delete(selectedSessionId);
        loadSessions();
        setShowDeleteModal(false);
        setSelectedSessionId(null);
      } catch (err) {
        alert(
          'Silme işlemi başarısız oldu: ' +
            (err instanceof Error ? err.message : 'Bilinmeyen hata'),
        );
        console.error('Delete session error:', err);
      }
    }
  };

  // Format data for display
  const formattedSessions = sessions.map((session) => ({
    ...session,
    startTimeFormatted: session.startTime
      ? new Date(session.startTime).toLocaleString('tr-TR')
      : '',
    endTimeFormatted: session.endTime ? new Date(session.endTime).toLocaleString('tr-TR') : '-',
  }));

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-bold">Oturumlar</h1>
        <p>Yükleniyor...</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Oturumlar"
          description="Oturumları görüntüleyin ve yönetin"
          actions={
            <Link href="/sessions/new">
              <Button>
                <span className="flex items-center gap-2">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Yeni Oturum
                </span>
              </Button>
            </Link>
          }
        />
        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6">
            <h2 className="mb-2 text-lg font-semibold text-red-800">Hata</h2>
            <p className="text-red-700">{error}</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="bg-light border-dark-200 rounded-lg border p-6 text-center">
            <p className="text-dark opacity-60">Henüz oturum bulunmamaktadır.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sessions.map((s) => (
              <div
                key={s.id}
                onClick={() => handleEdit(s)}
                className="bg-light border-dark-200 hover:bg-brand-50 hover:border-brand cursor-pointer rounded-md border p-3 transition"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-dark-900 truncate text-sm font-medium">{s.title}</div>
                    <div className="text-dark-600 truncate text-xs">
                      {s.speakerName || '-'} •{' '}
                      {s.startTime ? new Date(s.startTime).toLocaleString('tr-TR') : '-'}
                      {s.endTime ? ` - ${new Date(s.endTime).toLocaleString('tr-TR')}` : ''}
                    </div>
                  </div>
                  {s.sessionType && (
                    <span className="bg-dark-100 text-dark-600 border-dark-200/50 rounded-full border px-2 py-0.5 text-[10px] font-medium">
                      {s.sessionType}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Oturumu Sil">
        <p>Bu oturumu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.</p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="danger" onClick={confirmDelete}>
            Sil
          </Button>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            İptal
          </Button>
        </div>
      </Modal>
    </>
  );
}
*/
