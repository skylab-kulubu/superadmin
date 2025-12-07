'use client';

import { useState, useEffect } from 'react';

import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/tables/DataTable';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { CompetitorDto } from '@/types/api';
import { competitorsApi } from '@/lib/api/competitors';
import { getLeaderEventType } from '@/lib/utils/permissions';

export default function CompetitorsPage() {
  const router = useRouter();
  const [competitors, setCompetitors] = useState<CompetitorDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCompetitorId, setSelectedCompetitorId] = useState<string | null>(null);

  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    // Fetch user first
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
        }
      })
      .catch((err) => console.error('User fetch error:', err));
  }, []);

  const loadCompetitors = async () => {
    if (!currentUser) return; // Wait for user

    setLoading(true);
    setError(null);
    try {
      const response = await competitorsApi.getAll({ includeUser: true, includeEvent: true });
      if (response.success && response.data) {
        let data = response.data;

        // Filter for leaders
        // Filter for leaders
        const leaderEventType = getLeaderEventType(currentUser);

        if (leaderEventType) {
          data = data.filter((c) => c.event?.type?.name === leaderEventType);
        }

        setCompetitors(data);
      } else {
        setError(response.message || 'Yarışmacılar yüklenirken hata oluştu');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Yarışmacılar yüklenirken hata oluştu';
      // 403 hatası için özel mesaj
      if (errorMessage.includes('403') || errorMessage.includes('Forbidden')) {
        setError(
          'Bu sayfayı görüntülemek için gerekli yetkiniz bulunmamaktadır. Lütfen yöneticinizle iletişime geçin.',
        );
      } else {
        setError(errorMessage);
      }
      console.error('Competitors page fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadCompetitors();
    }
  }, [currentUser]);

  const handleEdit = (competitor: CompetitorDto) => {
    router.push(`/competitors/${competitor.id}/edit`);
  };

  const handleDelete = (competitor: CompetitorDto) => {
    setSelectedCompetitorId(competitor.id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (selectedCompetitorId) {
      try {
        await competitorsApi.delete(selectedCompetitorId);
        loadCompetitors();
        setShowDeleteModal(false);
        setSelectedCompetitorId(null);
      } catch (err) {
        alert(
          'Silme işlemi başarısız oldu: ' +
            (err instanceof Error ? err.message : 'Bilinmeyen hata'),
        );
        console.error('Delete competitor error:', err);
      }
    }
  };

  // Format data for display
  const formattedCompetitors = competitors.map((competitor) => ({
    ...competitor,
    userName: competitor.user ? `${competitor.user.firstName} ${competitor.user.lastName}` : '-',
    eventName: competitor.event?.name || '-',
    winnerText: competitor.winner ? 'Evet' : 'Hayır',
  }));

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-bold">Yarışmacılar</h1>
        <p>Yükleniyor...</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Yarışmacılar"
          description="Tüm yarışmacıları görüntüleyin ve yönetin"
          actions={
            <Link href="/competitors/new">
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
                  Yeni Yarışmacı
                </span>
              </Button>
            </Link>
          }
        />

        {competitors.length === 0 ? (
          /* Empty State */
          <div className="bg-light border-dark-200/50 rounded-xl border p-12 text-center shadow-lg">
            <div className="mx-auto max-w-md">
              <div className="bg-brand-100 mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full">
                <svg
                  className="text-brand-600 h-10 w-10"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-dark-800 mb-2 text-xl font-semibold">Henüz yarışmacı yok</h3>
              <p className="text-dark-600 mb-6">Sisteme ilk yarışmacıyı ekleyerek başlayın</p>
              <Link href="/competitors/new">
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
                    İlk Yarışmacıyı Ekle
                  </span>
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          /* Competitors Table */
          <div className="bg-light border-dark-200/50 rounded-xl border p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-brand-100 flex h-10 w-10 items-center justify-center rounded-lg">
                  <svg
                    className="text-brand-600 h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-dark-600 text-sm font-medium">Toplam Yarışmacı</p>
                  <p className="text-brand text-2xl font-bold">{competitors.length}</p>
                </div>
              </div>
            </div>
            <DataTable
              data={formattedCompetitors}
              columns={[
                { key: 'userName', header: 'Kullanıcı' },
                { key: 'eventName', header: 'Etkinlik' },
                {
                  key: 'points',
                  header: 'Puan',
                  render: (value) => (
                    <span className="bg-brand-100 text-brand-700 rounded-md px-2.5 py-1 text-sm font-semibold">
                      {value || 0}
                    </span>
                  ),
                },
                {
                  key: 'winnerText',
                  header: 'Kazanan',
                  render: (value) => (
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        value === 'Evet'
                          ? 'border border-purple-200/50 bg-purple-100 text-purple-700'
                          : 'bg-dark-100 text-dark-600 border-dark-200/50 border'
                      }`}
                    >
                      {value}
                    </span>
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
        title="Yarışmacıyı Sil"
      >
        <p>Bu yarışmacıyı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.</p>
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
