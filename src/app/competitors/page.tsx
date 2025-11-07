'use client';

import { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/tables/DataTable';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { CompetitorDto } from '@/types/api';
import { competitorsApi } from '@/lib/api/competitors';

export default function CompetitorsPage() {
  const router = useRouter();
  const [competitors, setCompetitors] = useState<CompetitorDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCompetitorId, setSelectedCompetitorId] = useState<string | null>(null);

  const loadCompetitors = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await competitorsApi.getAll({ includeUser: true, includeEvent: true });
      if (response.success && response.data) {
        setCompetitors(response.data);
      } else {
        setError(response.message || 'Yarışmacılar yüklenirken hata oluştu');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Yarışmacılar yüklenirken hata oluştu';
      // 403 hatası için özel mesaj
      if (errorMessage.includes('403') || errorMessage.includes('Forbidden')) {
        setError('Bu sayfayı görüntülemek için gerekli yetkiniz bulunmamaktadır. Lütfen yöneticinizle iletişime geçin.');
      } else {
        setError(errorMessage);
      }
      console.error('Competitors page fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompetitors();
  }, []);

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
        alert('Silme işlemi başarısız oldu: ' + (err instanceof Error ? err.message : 'Bilinmeyen hata'));
        console.error('Delete competitor error:', err);
      }
    }
  };

  // Format data for display
  const formattedCompetitors = competitors.map(competitor => ({
    ...competitor,
    userName: competitor.user ? `${competitor.user.firstName} ${competitor.user.lastName}` : '-',
    eventName: competitor.event?.name || '-',
    winnerText: competitor.winner ? 'Evet' : 'Hayır',
  }));

  if (loading) {
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Yarışmacılar</h1>
          <p>Yükleniyor...</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="Yarışmacılar"
          description="Tüm yarışmacıları görüntüleyin ve yönetin"
          actions={(
            <Link href="/competitors/new">
              <Button>
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Yeni Yarışmacı
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
                <p className="text-dark-700 mb-4">{error}</p>
                {error.includes('403') || error.includes('yetkiniz') ? (
                  <div className="text-sm text-dark-600 space-y-2">
                    <p>Bu sayfayı görüntülemek için gerekli yetkiniz bulunmamaktadır.</p>
                    <p className="text-xs text-dark-500">
                      Bu endpoint için backend SecurityConfig'de izin tanımlanmamış olabilir.
                    </p>
                    <p>Lütfen yöneticinizle iletişime geçin.</p>
                  </div>
                ) : (
                  <p className="text-sm text-dark-600">Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.</p>
                )}
              </div>
            </div>
          </div>
        ) : competitors.length === 0 ? (
          /* Empty State */
          <div className="bg-light border border-dark-200/50 rounded-xl shadow-lg p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 rounded-full bg-brand-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-dark-800 mb-2">Henüz yarışmacı yok</h3>
              <p className="text-dark-600 mb-6">Sisteme ilk yarışmacıyı ekleyerek başlayın</p>
              <Link href="/competitors/new">
                <Button>
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    İlk Yarışmacıyı Ekle
                  </span>
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          /* Competitors Table */
          <div className="bg-light rounded-xl shadow-lg border border-dark-200/50 p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-dark-600">Toplam Yarışmacı</p>
                  <p className="text-2xl font-bold text-brand">{competitors.length}</p>
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
                    <span className="px-2.5 py-1 bg-brand-100 text-brand-700 rounded-md font-semibold text-sm">
                      {value || 0}
                    </span>
                  ),
                },
                { 
                  key: 'winnerText', 
                  header: 'Kazanan',
                  render: (value) => (
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                      value === 'Evet' 
                        ? 'bg-purple-100 text-purple-700 border border-purple-200/50' 
                        : 'bg-dark-100 text-dark-600 border border-dark-200/50'
                    }`}>
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
          <Button variant="danger" onClick={confirmDelete}>Sil</Button>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>İptal</Button>
        </div>
      </Modal>
    </AppShell>
  );
}
