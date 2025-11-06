'use client';

import { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { DataTable } from '@/components/tables/DataTable';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { SeasonDto } from '@/types/api';
import { seasonsApi } from '@/lib/api/seasons';

export default function SeasonsPage() {
  const router = useRouter();
  const [seasons, setSeasons] = useState<SeasonDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSeasonId, setSelectedSeasonId] = useState<string | null>(null);

  const loadSeasons = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await seasonsApi.getAll();
      if (response.success && response.data) {
        setSeasons(response.data);
      } else {
        setError(response.message || 'Sezonlar yüklenirken hata oluştu');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sezonlar yüklenirken hata oluştu');
      console.error('Seasons page fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSeasons();
  }, []);

  const handleEdit = (season: SeasonDto) => {
    router.push(`/seasons/${season.id}/edit`);
  };

  const handleDelete = (season: SeasonDto) => {
    setSelectedSeasonId(season.id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (selectedSeasonId) {
      try {
        await seasonsApi.delete(selectedSeasonId);
        loadSeasons();
        setShowDeleteModal(false);
        setSelectedSeasonId(null);
      } catch (err) {
        alert('Silme işlemi başarısız oldu: ' + (err instanceof Error ? err.message : 'Bilinmeyen hata'));
        console.error('Delete season error:', err);
      }
    }
  };

  // Format data for display
  const formattedSeasons = seasons.map(season => ({
    ...season,
    startDateFormatted: season.startDate ? new Date(season.startDate).toLocaleDateString('tr-TR') : '',
    endDateFormatted: season.endDate ? new Date(season.endDate).toLocaleDateString('tr-TR') : '',
    statusText: season.active ? 'Aktif' : 'Pasif',
  }));

  if (loading) {
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Sezonlar</h1>
          <p>Yükleniyor...</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-yesil">Sezonlar</h1>
          <Link href="/seasons/new">
            <Button>Yeni Sezon</Button>
          </Link>
        </div>

        {error ? (
          <div className="bg-lacivert border border-pembe-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-yesil mb-2">Hata</h2>
            <p className="text-pembe mb-4">{error}</p>
            {error.includes('403') || error.includes('yetkiniz') ? (
              <div className="text-sm text-pembe">
                <p className="mb-2">Bu sayfayı görüntülemek için gerekli yetkiniz bulunmamaktadır.</p>
                <p className="mt-2 text-xs text-pembe opacity-60">
                  Bu endpoint için backend SecurityConfig'de izin tanımlanmamış olabilir.
                </p>
                <p className="mt-3 text-pembe">Lütfen yöneticinizle iletişime geçin.</p>
              </div>
            ) : (
              <p className="text-sm text-pembe">Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.</p>
            )}
          </div>
        ) : seasons.length === 0 ? (
          <div className="bg-lacivert border border-pembe-200 rounded-lg p-6 text-center">
            <p className="text-pembe opacity-60">Henüz sezon bulunmamaktadır.</p>
          </div>
        ) : (
          <DataTable
            data={formattedSeasons}
            columns={[
              { key: 'name', header: 'Ad' },
              { key: 'startDateFormatted', header: 'Başlangıç' },
              { key: 'endDateFormatted', header: 'Bitiş' },
              { key: 'statusText', header: 'Durum' },
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
        title="Sezonu Sil"
      >
        <p>Bu sezonu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.</p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="danger" onClick={confirmDelete}>Sil</Button>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>İptal</Button>
        </div>
      </Modal>
    </AppShell>
  );
}
