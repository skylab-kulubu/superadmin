'use client';

import { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
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
      console.error('Sessions page fetch error:', err);
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
        alert('Silme işlemi başarısız oldu: ' + (err instanceof Error ? err.message : 'Bilinmeyen hata'));
        console.error('Delete session error:', err);
      }
    }
  };

  // Format data for display
  const formattedSessions = sessions.map(session => ({
    ...session,
    startTimeFormatted: session.startTime ? new Date(session.startTime).toLocaleString('tr-TR') : '',
    endTimeFormatted: session.endTime ? new Date(session.endTime).toLocaleString('tr-TR') : '-',
  }));

  if (loading) {
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Oturumlar</h1>
          <p>Yükleniyor...</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="Oturumlar"
          description="Oturumları görüntüleyin ve yönetin"
          actions={(
            <Link href="/sessions/new">
              <Button>
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Yeni Oturum
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
        ) : sessions.length === 0 ? (
          <div className="bg-light border border-dark-200 rounded-lg p-6 text-center">
            <p className="text-dark opacity-60">Henüz oturum bulunmamaktadır.</p>
          </div>
        ) : (
          <DataTable
            data={formattedSessions}
            columns={[
              { key: 'title', header: 'Başlık' },
              { key: 'speakerName', header: 'Konuşmacı' },
              { key: 'startTimeFormatted', header: 'Başlangıç' },
              { key: 'endTimeFormatted', header: 'Bitiş' },
              { key: 'sessionType', header: 'Tip' },
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
        title="Oturumu Sil"
      >
        <p>Bu oturumu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.</p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="danger" onClick={confirmDelete}>Sil</Button>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>İptal</Button>
        </div>
      </Modal>
    </AppShell>
  );
}
